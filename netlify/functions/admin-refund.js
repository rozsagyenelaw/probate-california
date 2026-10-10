// Item 31: refunds started by Rozsa in the app. Admin only (Firebase ID token with the admin claim).
// Two steps, both POST:
//  1) { action: 'quote', paymentId }  -> what was paid, what is already refunded, the most that can be refunded,
//     the exact confirmation phrase, and the refund policy text.
//  2) { action: 'refund', paymentId, amountCents, reason, confirmPhrase, stopPlan? } -> refunds through Stripe,
//     records refunds/{id}, updates payments/{id} and cases/{id}.billing, writes auditLog, emails the client.
// The refund only happens when confirmPhrase exactly equals the phrase from the quote (server-side confirm).
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { admin, getDb, corsHeaders, verifyCaller, isAdminToken } = require('./lib/firebaseAdmin');
const { getBusinessSettings } = require('./lib/business');
const { recordChargeRefunded } = require('./lib/recordPayment');
const { queueRefundEmail } = require('./lib/paymentEmails');

const PLACEHOLDER_POLICY = 'Any part of the fee that has not been earned is refunded, as set out in your signed fee agreement.';
// Fixed format ($3,995.00) without relying on the runtime's locale data
const money = (c) => '$' + (Math.round(c) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const phraseFor = (amountCents) => `REFUND ${money(amountCents)}`;

async function chargeFor(p) {
  if (p.stripeChargeId) return stripe.charges.retrieve(p.stripeChargeId);
  if (p.stripePaymentIntentId) {
    const pi = await stripe.paymentIntents.retrieve(p.stripePaymentIntentId);
    if (pi.latest_charge) return stripe.charges.retrieve(pi.latest_charge);
  }
  if (p.stripeSessionId && p.stripeSessionId.startsWith('cs_')) {
    const s = await stripe.checkout.sessions.retrieve(p.stripeSessionId);
    if (s.payment_intent) { const pi = await stripe.paymentIntents.retrieve(s.payment_intent); if (pi.latest_charge) return stripe.charges.retrieve(pi.latest_charge); }
    if (s.invoice || s.subscription) {
      const invId = s.invoice || (await stripe.subscriptions.retrieve(s.subscription)).latest_invoice;
      const inv = await stripe.invoices.retrieve(invId);
      if (inv.charge) return stripe.charges.retrieve(inv.charge);
    }
  }
  return null;
}

exports.handler = async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  const caller = await verifyCaller(event);
  if (!isAdminToken(caller)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin only' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }; }
  try {
    const db = getDb();
    const payRef = db.collection('payments').doc(String(body.paymentId || ''));
    const paySnap = body.paymentId ? await payRef.get() : null;
    if (!paySnap || !paySnap.exists) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Payment not found' }) };
    const p = paySnap.data();
    const keyIsLive = String(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live') || String(process.env.STRIPE_SECRET_KEY || '').startsWith('rk_live');
    if (p.livemode !== undefined && !!p.livemode !== keyIsLive) return { statusCode: 409, headers, body: JSON.stringify({ error: `This payment was made in ${p.livemode ? 'live' : 'test'} mode and cannot be refunded from this site.` }) };

    const ch = await chargeFor(p);
    if (!ch) return { statusCode: 409, headers, body: JSON.stringify({ error: 'No Stripe charge found for this payment' }) };
    const refundable = ch.amount - ch.amount_refunded;
    const settings = await getBusinessSettings(db);
    const policyText = settings.refundPolicyText || PLACEHOLDER_POLICY;

    if (body.action === 'quote') {
      return { statusCode: 200, headers, body: JSON.stringify({
        paymentId: payRef.id, email: p.email, description: p.description || p.serviceType, paidCents: ch.amount,
        alreadyRefundedCents: ch.amount_refunded, maxRefundCents: refundable,
        installmentPlan: p.paymentPlan === 'installments', subscriptionId: p.stripeSubscriptionId || null,
        confirmPhraseFor: { full: phraseFor(refundable) }, confirmPhraseRule: 'Type REFUND followed by the amount, for example "REFUND $500.00"',
        policyText, policyApproved: !!settings.refundPolicyText, livemode: ch.livemode
      }) };
    }

    if (body.action !== 'refund') return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
    const amount = Math.round(Number(body.amountCents));
    if (!Number.isInteger(amount) || amount <= 0) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Enter an amount greater than zero' }) };
    if (amount > refundable) return { statusCode: 400, headers, body: JSON.stringify({ error: `At most ${money(refundable)} can be refunded on this payment` }) };
    const reason = String(body.reason || '').trim().slice(0, 300);
    if (!reason) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please write the reason for the refund' }) };
    if (String(body.confirmPhrase || '').trim() !== phraseFor(amount)) {
      return { statusCode: 409, headers, body: JSON.stringify({ error: `To confirm, type exactly: ${phraseFor(amount)}`, confirmPhrase: phraseFor(amount) }) };
    }

    const refund = await stripe.refunds.create({
      charge: ch.id, amount,
      metadata: { app: 'probate', paymentId: payRef.id, caseId: p.caseId || '', requestedBy: caller.email, reason }
    }, { idempotencyKey: `refund-${payRef.id}-${amount}-${String(body.requestId || '').slice(0, 40) || Date.now()}` });

    // Same bookkeeping as the charge.refunded webhook (both are idempotent on the refund id)
    const rec = await recordChargeRefunded(stripe, db, ch);
    await db.collection('refunds').doc(refund.id).set({ requestedBy: caller.email, reason, policyTextShown: policyText, confirmedPhrase: phraseFor(amount), createdVia: 'admin-refund' }, { merge: true });

    let planStopped = null;
    if (body.stopPlan && p.stripeSubscriptionId) {
      const sub = await stripe.subscriptions.retrieve(p.stripeSubscriptionId);
      if (sub.status !== 'canceled') { await stripe.subscriptions.cancel(p.stripeSubscriptionId, { prorate: false, invoice_now: false }); planStopped = true; }
    }

    await db.collection('auditLog').add({
      at: admin.firestore.FieldValue.serverTimestamp(), actorType: 'admin', actorUid: caller.uid, actorEmail: caller.email,
      action: 'payment.refund', caseId: p.caseId || null, clientUid: p.userId || null, target: `payments/${payRef.id}`, reason,
      meta: { refundId: refund.id, amountCents: amount, full: amount === refundable, planStopped, livemode: refund.livemode !== undefined ? refund.livemode : ch.livemode }
    });

    let customerName = null;
    if (p.userId) { const u = await db.collection('users').doc(p.userId).get(); if (u.exists) customerName = u.data().displayName || [u.data().firstName, u.data().lastName].filter(Boolean).join(' ') || null; }
    const mail = p.email ? await queueRefundEmail(db, { refundId: refund.id, email: p.email, customerName, amountCents: amount, full: amount === ch.amount, description: p.description, uid: p.userId || null }) : null;
    await db.collection('refunds').doc(refund.id).set({ clientEmailed: !!(mail && mail.queued), clientEmailOutbox: mail && mail.queued ? `refund-client-${refund.id}` : null }, { merge: true });

    return { statusCode: 200, headers, body: JSON.stringify({ refunded: true, refundId: refund.id, status: refund.status, amountCents: amount, recorded: rec, planStopped, clientEmailed: !!(mail && mail.queued) }) };
  } catch (err) {
    console.error('admin-refund error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
