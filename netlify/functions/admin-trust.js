// Admin trust view (Rozsa's decision 7). Admin only. W3-cockpit renders it in the portal admin.
// POST { action: 'clients' }                         -> one row per case with money: held for the client, earned, ready to move
// POST { action: 'case', caseId }                    -> full ledger for that case (every deposit, transfer, refund) and stages
// POST { action: 'markStage', caseId, stage, date, done } -> records that an earning stage is complete (or undoes it)
// POST { action: 'setInventoryValue', caseId, valueCents } -> the filed inventory total; shows any refund due under 10810
// POST { action: 'confirmFeeAdjustment', caseId, confirmPhrase } -> Rozsa confirms a tier or 10810 change after the inventory
// POST { action: 'recordTransfer', caseId, amountCents, note, confirmPhrase } -> records money Rozsa moved from trust to
//      operating for this case (she moves it at the bank; this is the ledger entry). Never more than ready to move.
// Never stores or returns a bank account number, routing number or bank balance.
const { admin, getDb, corsHeaders, verifyCaller, isAdminToken } = require('./lib/firebaseAdmin');
const { STAGES, computeCaseTrust } = require('./lib/trust');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createCheckout } = require('./lib/checkout');
const { getBusinessSettings } = require('./lib/business');

const ymd = (t) => (t && t.toDate ? t.toDate().toISOString().slice(0, 10) : (typeof t === 'string' ? t.slice(0, 10) : null));
const money = (c) => '$' + (Math.round(c) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const STAGE_KEYS = new Set([...STAGES.full, ...STAGES.simplified].map(s => s.key).concat(['accountingDelivered']));

async function loadCase(db, caseId) {
  const c = await db.collection('cases').doc(caseId).get();
  if (!c.exists) return null;
  const [p, r, t] = await Promise.all([
    db.collection('payments').where('caseId', '==', caseId).get(),
    db.collection('refunds').where('caseId', '==', caseId).get(),
    db.collection('trustTransfers').where('caseId', '==', caseId).get()
  ]);
  const payments = p.docs.map(d => ({ id: d.id, ...d.data(), date: ymd(d.data().createdAt) }));
  const refunds = r.docs.map(d => ({ id: d.id, ...d.data(), date: ymd(d.data().createdAt) }));
  const transfers = t.docs.map(d => ({ id: d.id, ...d.data(), date: ymd(d.data().createdAt) }));
  return { caseRef: c.ref, caseDoc: { id: c.id, ...c.data() }, payments, refunds, transfers };
}

exports.handler = async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  const caller = await verifyCaller(event);
  if (!isAdminToken(caller)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin only' }) };
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }; }
  const reply = (code, obj) => ({ statusCode: code, headers, body: JSON.stringify(obj) });

  try {
    const db = getDb();
    if (body.action === 'clients') {
      const paySnap = await db.collection('payments').get();
      const caseIds = [...new Set(paySnap.docs.map(d => d.data().caseId).filter(Boolean))];
      const rows = [];
      for (const id of caseIds) {
        const l = await loadCase(db, id);
        if (!l || l.caseDoc.archived) continue;
        const t = computeCaseTrust(l.caseDoc, l.payments, l.refunds, l.transfers);
        rows.push({ caseId: id, clientEmail: l.caseDoc.clientEmail || null, estateName: l.caseDoc.estateName || null, service: t.service,
          heldForClientCents: t.heldForClientCents, earnedCents: t.earned.totalCents, transferredCents: t.transferredCents, readyToMoveCents: t.readyToMoveCents,
          percentEarned: t.percentEarned, capRefundDueCents: t.capRefundDueCents, test: l.payments.every(p => p.livemode === false) });
      }
      rows.sort((a, b) => b.readyToMoveCents - a.readyToMoveCents);
      return reply(200, { rows, note: 'Figures are this client\'s ledger only, never a bank balance.' });
    }

    const caseId = String(body.caseId || '');
    const l = caseId ? await loadCase(db, caseId) : null;
    if (!l) return reply(404, { error: 'Case not found' });

    if (body.action === 'case') return reply(200, { caseId, ...computeCaseTrust(l.caseDoc, l.payments, l.refunds, l.transfers) });

    if (body.action === 'markStage') {
      if (!STAGE_KEYS.has(body.stage)) return reply(400, { error: 'Unknown stage' });
      const date = body.done === false ? null : (/^\d{4}-\d{2}-\d{2}$/.test(String(body.date || '')) ? body.date : new Date().toISOString().slice(0, 10));
      await l.caseRef.update({ [`feeStages.${body.stage}`]: date, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      await db.collection('auditLog').add({ at: admin.firestore.FieldValue.serverTimestamp(), actorType: 'admin', actorUid: caller.uid, actorEmail: caller.email, action: 'trust.stage', caseId, target: `cases/${caseId}`, meta: { stage: body.stage, date } });
      const after = await loadCase(db, caseId);
      return reply(200, { caseId, ...computeCaseTrust(after.caseDoc, after.payments, after.refunds, after.transfers) });
    }

    if (body.action === 'setInventoryValue') {
      const v = Math.round(Number(body.valueCents));
      if (!Number.isInteger(v) || v < 0) return reply(400, { error: 'Enter the inventory and appraisal total' });
      await l.caseRef.update({ inventoryValueCents: v, inventoryValueSetAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      await db.collection('auditLog').add({ at: admin.firestore.FieldValue.serverTimestamp(), actorType: 'admin', actorUid: caller.uid, actorEmail: caller.email, action: 'trust.inventoryValue', caseId, target: `cases/${caseId}`, meta: { valueCents: v } });
      const after = await loadCase(db, caseId);
      return reply(200, { caseId, ...computeCaseTrust(after.caseDoc, after.payments, after.refunds, after.transfers) });
    }

    // Rozsa confirms the fee change after the inventory. Refund: she then refunds through the refund screen (admin-refund).
    // Balance due: a Stripe payment link for exactly that amount is created for her to send to the client.
    if (body.action === 'confirmFeeAdjustment') {
      const t = computeCaseTrust(l.caseDoc, l.payments, l.refunds, l.transfers);
      const a = t.feeAdjustment;
      if (!a || a.kind === 'none') return reply(400, { error: 'No fee change to confirm for this case' });
      const phrase = `${a.kind === 'refund' ? 'REFUND' : 'BALANCE'} ${money(a.amountCents)}`;
      if (String(body.confirmPhrase || '').trim() !== phrase) return reply(409, { error: `To confirm, type exactly: ${phrase}`, confirmPhrase: phrase });
      const record = { inventoryValueCents: a.inventoryValueCents, kind: a.kind, amountCents: a.amountCents, tierNow: a.tierNow, confirmedBy: caller.email, confirmedAt: admin.firestore.FieldValue.serverTimestamp() };
      let link = null;
      if (a.kind === 'balance') {
        const settings = await getBusinessSettings(db);
        const co = await createCheckout(stripe, db, { serviceType: 'fee_balance', balanceCents: a.amountCents, paymentPlan: 'full', customerEmail: l.caseDoc.clientEmail || null, caseId, userId: l.caseDoc.userId || '', source: 'fee-adjustment', cancelPath: '/dashboard' }, settings);
        link = co.url; record.paymentLink = co.url; record.stripeSessionId = co.sessionId;
      }
      await l.caseRef.update({ feeAdjustment: record, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      await db.collection('auditLog').add({ at: admin.firestore.FieldValue.serverTimestamp(), actorType: 'admin', actorUid: caller.uid, actorEmail: caller.email, action: 'trust.feeAdjustment', caseId, target: `cases/${caseId}`, meta: { kind: a.kind, amountCents: a.amountCents } });
      return reply(200, { confirmed: true, kind: a.kind, amountCents: a.amountCents, paymentLink: link, next: a.kind === 'refund' ? 'Refund it from the refund screen (it asks you to confirm again).' : 'Send the payment link to the client.' });
    }

    if (body.action === 'recordTransfer') {
      const t = computeCaseTrust(l.caseDoc, l.payments, l.refunds, l.transfers);
      const amount = Math.round(Number(body.amountCents));
      if (!Number.isInteger(amount) || amount <= 0) return reply(400, { error: 'Enter an amount greater than zero' });
      if (amount > t.readyToMoveCents) return reply(400, { error: `Only ${money(t.readyToMoveCents)} is earned and ready to move for this client` });
      const phrase = `MOVE ${money(amount)}`;
      if (String(body.confirmPhrase || '').trim() !== phrase) return reply(409, { error: `To confirm, type exactly: ${phrase}`, confirmPhrase: phrase });
      const reached = t.stages.filter(s => s.completedOn).map(s => s.label);
      const ref = await db.collection('trustTransfers').add({
        caseId, userId: l.caseDoc.userId || null, amountCents: amount,
        stage: reached[reached.length - 1] || null, note: String(body.note || '').slice(0, 300) || null,
        recordedBy: caller.email, createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      await db.collection('auditLog').add({ at: admin.firestore.FieldValue.serverTimestamp(), actorType: 'admin', actorUid: caller.uid, actorEmail: caller.email, action: 'trust.transfer', caseId, target: `trustTransfers/${ref.id}`, meta: { amountCents: amount } });
      const after = await loadCase(db, caseId);
      return reply(200, { recorded: ref.id, caseId, ...computeCaseTrust(after.caseDoc, after.payments, after.refunds, after.transfers) });
    }
    return reply(400, { error: 'Unknown action' });
  } catch (err) {
    console.error('admin-trust error:', err.message);
    return reply(500, { error: err.message });
  }
};
