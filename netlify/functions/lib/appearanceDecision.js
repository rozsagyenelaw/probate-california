// Short notice court appearance (Rozsa, decisions 2026-10-12 point 4): the office confirms within 1 business day,
// or marks "cannot appear", which refunds the payment in full automatically. Used by admin-hearing.js.
//
// The refund can never happen twice:
//  1. A Firestore transaction moves the appearance from 'pending' to 'declined' and stores a fixed refund key
//     (appearance-decline-<caseId>-<hearingId>). A second "cannot appear" finds 'declined' and only finishes a refund
//     that is still missing; it never starts a new one.
//  2. Before creating a refund, the charge's existing refunds are searched for that key (metadata.appearanceKey).
//  3. The Stripe call carries the same key as its idempotency key.
//  4. The refund id is recorded on the hearing (appearance.refund) and in refunds/{id}.
const { admin } = require('./firebaseAdmin');
const { recordChargeRefunded } = require('./recordPayment');

const FV = admin.firestore.FieldValue;
const live = (h) => h && !['continued', 'off-calendar', 'vacated', 'cancelled'].includes(h.outcome) && !h.archived;

async function chargeFor(stripe, p) {
  if (p.stripeChargeId) return stripe.charges.retrieve(p.stripeChargeId);
  if (p.stripePaymentIntentId) {
    const pi = await stripe.paymentIntents.retrieve(p.stripePaymentIntentId);
    if (pi.latest_charge) return stripe.charges.retrieve(pi.latest_charge);
  }
  if (p.stripeSessionId && String(p.stripeSessionId).startsWith('cs_')) {
    const s = await stripe.checkout.sessions.retrieve(p.stripeSessionId);
    if (s.payment_intent) { const pi = await stripe.paymentIntents.retrieve(s.payment_intent); if (pi.latest_charge) return stripe.charges.retrieve(pi.latest_charge); }
  }
  return null;
}

function patchHearing(list, hearingId, fn) {
  const out = (Array.isArray(list) ? list : []).map((h) => ({ ...h }));
  const i = out.findIndex((h) => h && h.id === hearingId);
  if (i < 0) return null;
  out[i] = fn(out[i]);
  return out;
}

// decision: 'confirm' | 'decline'. Returns { status, refund?, already? }.
async function decideAppearance(db, stripe, { caseId, hearingId, decision, actorEmail }) {
  if (!['confirm', 'decline'].includes(decision)) throw Object.assign(new Error('Unknown decision'), { status: 400 });
  const ref = db.collection('cases').doc(String(caseId || ''));
  const key = `appearance-decline-${caseId}-${hearingId}`;

  // Step 1: record the decision once
  const step1 = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw Object.assign(new Error('Case not found'), { status: 404 });
    const c = snap.data();
    const h = (c.hearings || []).find((x) => x && x.id === hearingId);
    if (!h || !live(h) || !h.appearance) throw Object.assign(new Error('No appearance on that hearing'), { status: 404 });
    const a = h.appearance;
    if (a.confirmation === 'confirmed' || a.confirmation === 'declined') {
      return { already: true, confirmation: a.confirmation, c, h };
    }
    if (a.confirmation !== 'pending') throw Object.assign(new Error('This appearance is not waiting for a short notice decision'), { status: 409 });
    const now = admin.firestore.Timestamp.now();
    const hearings = patchHearing(c.hearings, hearingId, (x) => ({
      ...x,
      appearanceRequested: decision === 'confirm',
      appearance: decision === 'confirm'
        ? { ...x.appearance, confirmation: 'confirmed', confirmedAt: now, confirmedBy: actorEmail || null }
        : { ...x.appearance, confirmation: 'declined', declinedAt: now, declinedBy: actorEmail || null, refund: x.appearance.paymentId ? { status: 'pending', key } : { status: 'none-needed' } }
    }));
    tx.update(ref, { hearings, updatedAt: FV.serverTimestamp() });
    return { already: false, confirmation: decision === 'confirm' ? 'confirmed' : 'declined', c, h: hearings.find((x) => x.id === hearingId) };
  });

  const c = step1.c;
  const a = step1.h.appearance || {};
  if (step1.confirmation === 'confirmed') {
    if (!step1.already) await queueClient(db, c, 'appearanceConfirmed', `appearance-confirmed-${caseId}-${hearingId}`, { date: step1.h.date, time: step1.h.time || '', department: step1.h.department || '', courthouse: step1.h.courthouse || '' });
    await audit(db, actorEmail, 'hearing.appearance.confirm', caseId, { hearingId, already: step1.already });
    return { status: 'confirmed', already: step1.already };
  }

  // Declined: refund (or finish a refund that is still missing)
  let refund = a.refund || { status: 'none-needed' };
  if (refund.status === 'pending' && a.paymentId) {
    refund = await refundOnce(db, stripe, { paymentId: a.paymentId, key, caseId, hearingId, actorEmail });
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const hearings = patchHearing(snap.data().hearings, hearingId, (x) => ({ ...x, appearance: { ...x.appearance, refund } }));
      if (hearings) tx.update(ref, { hearings, updatedAt: FV.serverTimestamp() });
    });
  }
  if (!step1.already || refund.justCreated) {
    await queueClient(db, c, 'appearanceDeclined', `appearance-declined-${caseId}-${hearingId}`, { date: step1.h.date, time: step1.h.time || '', department: step1.h.department || '', refundCents: refund.amountCents || 0 });
  }
  await audit(db, actorEmail, 'hearing.appearance.decline', caseId, { hearingId, already: step1.already, refundId: refund.id || null, refundCents: refund.amountCents || 0 });
  const { justCreated, ...stored } = refund;
  return { status: 'declined', already: step1.already, refund: stored };
}

async function refundOnce(db, stripe, { paymentId, key, caseId, hearingId, actorEmail }) {
  const pay = await db.collection('payments').doc(String(paymentId)).get();
  if (!pay.exists) return { status: 'failed', key, error: 'Payment not found' };
  const ch = await chargeFor(stripe, pay.data());
  if (!ch) return { status: 'failed', key, error: 'No Stripe charge found' };
  // A refund already made for this key (for example a retry after a timeout) is reused, never repeated
  const existing = ((await stripe.refunds.list({ charge: ch.id, limit: 100 })).data || []).find((r) => r.metadata && r.metadata.appearanceKey === key && r.status !== 'failed' && r.status !== 'canceled');
  let r = existing;
  let justCreated = false;
  if (!r) {
    const amount = ch.amount - ch.amount_refunded;
    if (amount <= 0) return { status: 'already-refunded', key, amountCents: 0 };
    r = await stripe.refunds.create({ charge: ch.id, amount, metadata: { app: 'probate', appearanceKey: key, paymentId: String(paymentId), caseId: String(caseId), hearingId: String(hearingId), reason: 'Short notice court appearance: the office cannot appear' } }, { idempotencyKey: key });
    justCreated = true;
  }
  await recordChargeRefunded(stripe, db, await stripe.charges.retrieve(ch.id));
  await db.collection('refunds').doc(r.id).set({ requestedBy: actorEmail || null, reason: 'Short notice court appearance: the office cannot appear', createdVia: 'appearance-decline', appearanceKey: key, caseId, hearingId }, { merge: true });
  return { status: r.status === 'failed' ? 'failed' : 'refunded', id: r.id, amountCents: r.amount, key, at: admin.firestore.Timestamp.now(), justCreated };
}

async function queueClient(db, c, template, id, data) {
  const to = String(c.clientEmail || '').toLowerCase();
  if (!to) return;
  // Stripe test key outside the emulator: only test inboxes (same rule as lib/paymentEmails.js)
  if (String(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test') && !/^rozsagyenelaw1\+[^@]+@gmail\.com$/i.test(to)) return;
  let first = '';
  if (c.userId) { const u = await db.collection('users').doc(String(c.userId)).get().catch(() => null); if (u && u.exists) first = u.data().firstName || String(u.data().displayName || '').split(' ')[0] || ''; }
  await db.collection('mailOutbox').doc(id).create({ template, to, uid: c.userId || null, data: { firstName: first, ...data }, source: 'admin-hearing', createdAt: FV.serverTimestamp() }).catch((e) => {
    if (!/already exists|ALREADY_EXISTS/i.test(e.message)) throw e; // exactly once
  });
}

async function audit(db, actorEmail, action, caseId, meta) {
  await db.collection('auditLog').add({ at: FV.serverTimestamp(), actorType: 'admin', actorEmail: actorEmail || null, action, caseId, target: `cases/${caseId}`, meta });
}

module.exports = { decideAppearance, refundOnce, chargeFor };
