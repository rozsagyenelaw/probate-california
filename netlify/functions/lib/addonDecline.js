// Item L (Rozsa, eighth message, approved as proposed in APPROVAL-addon-decline.pdf): one-step "Decline and refund"
// for an add-on (court appearance, final account, house sale papers) paid while no paid probate package is on file.
// The office decides each time; it is never automatic. Used by admin-hearing.js (action 'addon-decline').
//
// The refund can never happen twice (the same safeguards as the short notice "Cannot appear"):
//  1. A Firestore transaction moves payments/{id}.addonDecline from nothing to 'pending' with a fixed key
//     (addon-decline-<paymentId>); a second click finds it and only finishes a refund that is still missing.
//  2. Before creating a refund, the charge's refunds are searched for that key (metadata.appearanceKey).
//  3. The Stripe call carries the same key as its idempotency key.
//  4. The refund id is recorded on the payment, on the hearing (for an appearance) and in refunds/{id}.
const { admin } = require('./firebaseAdmin');
const { refundOnce } = require('./appearanceDecision');

const FV = admin.firestore.FieldValue;
const ADDONS = ['court_appearance', 'accounting_addon', 'house_sale'];
const PROBATE = ['simplified', 'full'];

function kindOf(p) {
  if (p.serviceType === 'court_appearance' || (p.courtAppearance && !p.addOns?.accounting)) return 'appearance';
  if (p.serviceType === 'accounting_addon') return 'accounting';
  if (p.serviceType === 'house_sale') return 'house-sale';
  return null;
}

function hasPaidPackage(c) {
  return !!c && ['paid', 'installments_active'].includes(c.paymentStatus) && PROBATE.includes(String(c.serviceType || ''));
}

const ymd = (t) => { const ms = t && t.toMillis ? t.toMillis() : (t ? Date.parse(t) : 0); return ms ? new Date(ms).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }) : ''; };

// { status: 'declined', already, refund, kind }
async function declineAddon(db, stripe, { caseId, paymentId, actorEmail }) {
  const payRef = db.collection('payments').doc(String(paymentId || ''));
  const caseRef = db.collection('cases').doc(String(caseId || ''));
  const key = `addon-decline-${paymentId}`;

  const step1 = await db.runTransaction(async (tx) => {
    const [ps, cs] = [await tx.get(payRef), await tx.get(caseRef)];
    if (!ps.exists) throw Object.assign(new Error('Payment not found'), { status: 404 });
    if (!cs.exists) throw Object.assign(new Error('Case not found'), { status: 404 });
    const p = ps.data(); const c = cs.data();
    if (p.caseId && p.caseId !== caseRef.id) throw Object.assign(new Error('This payment belongs to another case'), { status: 409 });
    if (!ADDONS.includes(p.serviceType)) throw Object.assign(new Error('Only an add-on can be declined here'), { status: 409 });
    if (p.addonDecline) return { already: true, p, c };
    if (hasPaidPackage(c)) throw Object.assign(new Error('This case has a paid probate package; the add-on stays'), { status: 409 });
    const now = admin.firestore.Timestamp.now();
    tx.update(payRef, { addonDecline: { status: 'pending', key, by: actorEmail || null, at: now } });
    // An appearance comes off its hearing, so "Rozsa appears for you" no longer shows
    const hearings = Array.isArray(c.hearings) ? c.hearings.map((h) => ({ ...h })) : [];
    let changed = false;
    for (const h of hearings) {
      if (h.appearance && (h.appearance.paymentId === payRef.id || h.appearance.stripeSessionId === payRef.id)) {
        h.appearanceRequested = false;
        h.appearance = { ...h.appearance, confirmation: 'declined', declinedAt: now, declinedBy: actorEmail || null, declineReason: 'addon-no-package', refund: { status: 'pending', key } };
        changed = true;
      }
    }
    if (changed) tx.update(caseRef, { hearings, updatedAt: FV.serverTimestamp() });
    return { already: false, p, c, hearing: hearings.find((h) => h.appearance && h.appearance.paymentId === payRef.id) || null };
  });

  const p = step1.p;
  let refund = (p.addonDecline && p.addonDecline.refund) || null;
  if (!refund || refund.status !== 'refunded') {
    refund = await refundOnce(db, stripe, { paymentId: payRef.id, key, caseId: caseRef.id, hearingId: 'addon', actorEmail });
    const { justCreated, ...stored } = refund;
    await payRef.update({ 'addonDecline.status': stored.status === 'refunded' || stored.status === 'already-refunded' ? 'declined' : stored.status, 'addonDecline.refund': stored });
    await db.runTransaction(async (tx) => {
      const cs = await tx.get(caseRef);
      const hearings = (cs.data().hearings || []).map((h) => (h.appearance && h.appearance.paymentId === payRef.id ? { ...h, appearance: { ...h.appearance, refund: stored } } : h));
      tx.update(caseRef, { hearings, updatedAt: FV.serverTimestamp() });
    });
  }
  const kind = kindOf(p);
  if (!step1.already) {
    const hearingDate = (step1.hearing && step1.hearing.date) || (p.courtAppearance && p.courtAppearance.hearing && p.courtAppearance.hearing.d) || '';
    await queueClient(db, step1.c, p, `addon-declined-${payRef.id}`, { kind, hearingDate, paymentDate: ymd(p.createdAt), refundCents: refund.amountCents || 0 });
    await db.collection('auditLog').add({ at: FV.serverTimestamp(), actorType: 'admin', actorEmail: actorEmail || null, action: 'addon.decline', caseId: caseRef.id, target: `payments/${payRef.id}`,
      meta: { kind, refundId: refund.id || null, refundCents: refund.amountCents || 0, refundStatus: refund.status } });
  }
  const { justCreated, ...stored } = refund;
  return { status: 'declined', already: step1.already, refund: stored, kind };
}

async function queueClient(db, c, p, id, data) {
  const to = String(p.email || c.clientEmail || '').toLowerCase();
  if (!to) return;
  if (String(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test') && !/^rozsagyenelaw1\+[^@]+@gmail\.com$/i.test(to)) return; // test key: test inboxes only
  let first = '';
  if (c.userId) { const u = await db.collection('users').doc(String(c.userId)).get().catch(() => null); if (u && u.exists) first = u.data().firstName || ''; }
  await db.collection('mailOutbox').doc(id).create({ template: 'addonDeclined', to, uid: c.userId || null, data: { firstName: first, ...data }, source: 'admin-hearing', createdAt: FV.serverTimestamp() }).catch((e) => {
    if (!/already exists|ALREADY_EXISTS/i.test(e.message)) throw e;
  });
}

module.exports = { declineAddon, hasPaidPackage, kindOf };
