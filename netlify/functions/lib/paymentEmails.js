// Payment and refund emails. All of them go through W2-email's portal outbox: this file writes
// mailOutbox/{id}; the portal's onMailOutbox renders the shared templates (paymentConfirmation,
// paymentAlert, refundConfirmation in myprobateca-portal/functions/emails/templates.js), sends from
// rozsa@myprobateca.com (Gmail fallback), logs to emailLog and stops the marketing drip on payment.
// W2-payments decides WHAT each email says per kind of purchase (item 30): the wording lives in those
// templates; `description` (from lib/pricing.js) names what was bought.
const admin = require('firebase-admin');

// Same rule as the portal template's purchaseKind()
function kindOf(meta) {
  if (meta.serviceType === 'simplified' || meta.serviceType === 'full') return 'probate';
  if (meta.courtAppearance && !meta.accountingAddon) return 'court';
  if (meta.accountingAddon && !meta.courtAppearance) return 'accounting';
  return 'addons';
}

// Test-mode safety: with a Stripe test key (outside the emulator), mail goes only to test inboxes
// and no office alert is queued (local test runs write to production Firestore).
function testMode() {
  return String(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test') && !process.env.FIRESTORE_EMULATOR_HOST;
}
function allowed(to) {
  if (!String(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test')) return true;
  return /^rozsagyenelaw1\+[^@]+@gmail\.com$/i.test(to);
}

async function queuePaymentEmails(db, { meta, email, customerName, amountCents, orderNumber, sessionId, uid, description, hearing, installmentAmounts, intakeDone }) {
  const data = {
    customerName: customerName || '',
    customerEmail: String(email || '').toLowerCase(),
    serviceType: meta.serviceType || null,
    probateType: (meta.serviceType === 'simplified' || meta.serviceType === 'full') ? meta.serviceType : null,
    accountingAddon: meta.accountingAddon || null,
    courtAppearance: meta.courtAppearance || null,
    hearing: hearing || null,
    shortNotice: meta.shortNotice === '1', // hearing fewer than 7 days away: the office confirms within 1 business day
    intakeDone: intakeDone === true ? true : (intakeDone === false ? false : null), // W6 F17: answers already sent?
    balanceFor: meta.balanceFor || null,
    description: description || '',
    paymentPlan: meta.paymentPlan || 'full',
    installmentAmounts: Array.isArray(installmentAmounts) && installmentAmounts.length === 3 ? installmentAmounts.map(Number) : null,
    promoCode: meta.promoCode || '',
    amount: amountCents,
    orderNumber: orderNumber || '',
    stripeSessionId: sessionId
  };
  const now = admin.firestore.FieldValue.serverTimestamp();
  const outbox = db.collection('mailOutbox');
  const test = testMode();
  if (test && !allowed(data.customerEmail)) return { skipped: 'test mode, non-test address' };
  await outbox.doc(`pay-client-${sessionId}`).set({ template: 'paymentConfirmation', to: data.customerEmail, uid: uid || null, data, stopDripFor: data.customerEmail, source: 'stripe-webhook', createdAt: now });
  if (!test) await outbox.doc(`pay-office-${sessionId}`).set({ template: 'paymentAlert', to: 'office', replyTo: data.customerEmail, data, source: 'stripe-webhook', createdAt: now });
  return { queued: true, officeAlert: !test, kind: kindOf(meta) };
}

// Short notice appearance that costs nothing (included under the 10810 limit): no Stripe payment, so no payment alert.
// The office still gets the alert, because it must confirm within 1 business day.
async function queueShortNoticeIncludedAlert(db, { caseId, email, customerName, hearing, courtAppearance }) {
  if (testMode() && !allowed(String(email || '').toLowerCase())) return { skipped: 'test mode, non-test address' };
  if (testMode()) return { skipped: 'test mode: no office alert' };
  const id = `pay-office-included-${caseId}-${String((hearing && (hearing.hearingDate || hearing.d)) || '').slice(0, 10)}`;
  await db.collection('mailOutbox').doc(id).set({ template: 'paymentAlert', to: 'office', replyTo: email || null, source: 'create-checkout-session', createdAt: admin.firestore.FieldValue.serverTimestamp(),
    data: { customerName: customerName || '', customerEmail: String(email || '').toLowerCase(), serviceType: 'court_appearance', courtAppearance: courtAppearance || 'remote', amount: 0, description: 'Court appearance (included under the Probate Code 10810 limit)', shortNotice: true, orderNumber: '', stripeSessionId: '',
      hearing: hearing ? { d: String(hearing.hearingDate || hearing.d || '').slice(0, 10), t: String(hearing.hearingTime || hearing.t || '').slice(0, 5), dept: hearing.department || hearing.dept || '' } : null } });
  return { queued: true };
}

// Refund confirmation to the client (admin-refund). Returns { queued } or { skipped }.
async function queueRefundEmail(db, { refundId, email, customerName, amountCents, full, description, uid }) {
  const to = String(email || '').toLowerCase();
  if (testMode() && !allowed(to)) return { skipped: 'test mode, non-test address' };
  await db.collection('mailOutbox').doc(`refund-client-${refundId}`).set({
    template: 'refundConfirmation', to, uid: uid || null,
    data: { customerName: customerName || '', amount: amountCents, full: !!full, description: description || '' },
    source: 'admin-refund', createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { queued: true };
}

module.exports = { queuePaymentEmails, queueRefundEmail, queueShortNoticeIncludedAlert, kindOf, allowed };
