// Payment emails (admin alert and client confirmation). W2-email owns the sender and the shared
// template look; W2-payments owns WHAT each email says for each kind of purchase (item 30).
const nodemailer = require('nodemailer');

const SIGNATURE_HTML = `<p style="margin-top:24px;color:#374151">Rozsa Gyene, Esq.<br>Law Offices of Rozsa Gyene<br>3500 W. Olive Ave., Suite 300<br>Burbank, CA 91505<br>818-337-4071<br>rozsa@myprobateca.com</p>`;
const ADMIN_TO = () => process.env.ADMIN_NOTIFY_EMAIL || 'rozsagyenelaw@yahoo.com';
// Fixed format ($3,995.00) without relying on the runtime's locale data
const money = (c) => '$' + (Math.round(c) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

let transporter = null;
function getTransporter() {
  if (!transporter) transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER || 'rozsagyenelaw1@gmail.com', pass: process.env.EMAIL_PASS } });
  return transporter;
}

// Test-mode safety: with a Stripe test key, mail goes only to test inboxes.
function allowed(to) {
  const testMode = String(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test');
  if (!testMode) return true;
  return /^rozsagyenelaw1\+[^@]+@gmail\.com$/i.test(to);
}

async function send(mail) {
  if (!allowed(mail.to)) { console.log('Test mode: email not sent to non-test address'); return { skipped: true }; }
  try { await getTransporter().sendMail({ from: '"MyProbateCA" <rozsagyenelaw1@gmail.com>', replyTo: 'rozsa@myprobateca.com', ...mail }); return { sent: true }; } catch (e) { console.error('email failed:', e.message); return { error: e.message }; }
}

function kindOf(meta) {
  if (meta.serviceType === 'simplified' || meta.serviceType === 'full') return 'probate';
  if (meta.courtAppearance && !meta.accountingAddon) return 'court';
  if (meta.accountingAddon && !meta.courtAppearance) return 'accounting';
  return 'addons';
}

function nextSteps(kind) {
  if (kind === 'accounting') return ['We will contact you to collect the estate\'s money records (what came in and what was paid out).', 'We prepare the accounting for the court.', 'Attorney Rozsa Gyene reviews it.', 'You receive the finished accounting with instructions.'];
  if (kind === 'court') return ['We confirm your hearing date, time and department.', 'Attorney Rozsa Gyene appears at the hearing for you.', 'We tell you the result and what happens next.'];
  if (kind === 'addons') return ['We confirm the details of the services you added.', 'You will see each one on your dashboard as it moves forward.'];
  return ['If you have not done so yet, sign in and answer the case questions so we can start.', 'Attorney Rozsa Gyene reviews your information.', 'We prepare your court documents and keep you updated in your account.'];
}

async function sendPaymentEmails({ meta, email, customerName, description, amountCents, hearing, installments }) {
  const kind = kindOf(meta);
  const first = (customerName || '').trim().split(/\s+/)[0];
  const greet = first ? `Dear ${esc(first)},` : 'Hello,';
  const planLine = installments ? `<p>This is payment 1 of 3. The next two payments are charged monthly to the same card, and the plan stops after the third payment.</p>` : '';
  const hearingLine = hearing && hearing.d ? `<p>Hearing you told us about: ${esc(hearing.d)}${hearing.t ? ' at ' + esc(hearing.t) : ''}${hearing.dept ? ', Department ' + esc(hearing.dept) : ''}${hearing.co ? ', ' + esc(hearing.co) + ' County' : ''}.</p>` : '';
  const subjectFor = { probate: 'Payment received: your probate case', accounting: 'Payment received: your accounting service', court: 'Payment received: your court appearance', addons: 'Payment received: your added services' };

  const client = await send({
    to: email,
    subject: subjectFor[kind],
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px">
      <p>${greet}</p>
      <p>Thank you. We received your payment of ${money(amountCents)} for: <strong>${esc(description)}</strong>.</p>
      ${planLine}${hearingLine}
      <p><strong>What happens next</strong></p>
      <ol>${nextSteps(kind).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <p>You can see your case any time at <a href="https://myprobateca.com/dashboard">myprobateca.com/dashboard</a>. Stripe also emails you a receipt for this payment.</p>
      <p>Questions? Please call 818-337-4071.</p>
      ${SIGNATURE_HTML}
    </div>`
  });

  const adminTo = ADMIN_TO();
  const adminRes = await send({
    to: adminTo,
    subject: `New payment: ${description} (${money(amountCents)})`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6">
      <p><strong>${esc(customerName || 'Name not given')}</strong> (${esc(email)}) paid ${money(amountCents)}.</p>
      <p>Bought: ${esc(description)}<br>Plan: ${installments ? '3 monthly payments (payment 1 of 3)' : 'paid in full'}${meta.promoCode ? '<br>Promo code: ' + esc(meta.promoCode) : ''}</p>
      ${hearingLine}
      <p><a href="https://portal.myprobateca.com/admin">Open the admin</a></p>
    </div>`
  });
  return { client, admin: adminRes, kind };
}

async function sendRefundEmail({ email, customerName, amountCents, full, description }) {
  const first = (customerName || '').trim().split(/\s+/)[0];
  return send({
    to: email,
    subject: 'Your refund is on its way',
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px">
      <p>${first ? 'Dear ' + esc(first) + ',' : 'Hello,'}</p>
      <p>We have refunded ${money(amountCents)}${description ? ' for ' + esc(description) : ''}${full ? '' : ' (part of your payment)'} to the card or account you paid with. Your bank decides how soon it shows on your statement.</p>
      <p>Questions? Please call 818-337-4071.</p>
      ${SIGNATURE_HTML}
    </div>`
  });
}

module.exports = { sendPaymentEmails, sendRefundEmail, kindOf, allowed };

// W2-email's portal outbox (mailOutbox -> onMailOutbox renders the shared templates, sends from
// rozsa@myprobateca.com and stops the marketing drip). Used for probate and accounting purchases.
// Court appearance purchases still use sendPaymentEmails() above until the portal template renders
// data.description (requested from W2-email in notes/needs-W2-payments.md).
async function queuePaymentEmails(db, { meta, email, customerName, amountCents, orderNumber, sessionId, uid, description, hearing }) {
  const admin = require('firebase-admin');
  const data = {
    customerName: customerName || '',
    customerEmail: String(email || '').toLowerCase(),
    serviceType: meta.serviceType || 'full',
    probateType: (meta.serviceType === 'simplified' || meta.serviceType === 'full') ? meta.serviceType : null,
    accountingAddon: meta.accountingAddon || null,
    courtAppearance: meta.courtAppearance || null,
    hearing: hearing || null,
    description: description || '',
    paymentPlan: meta.paymentPlan || 'full',
    amount: amountCents,
    orderNumber: orderNumber || '',
    stripeSessionId: sessionId
  };
  const now = admin.firestore.FieldValue.serverTimestamp();
  const outbox = db.collection('mailOutbox');
  // Test-mode safety (local Stripe test runs write to production Firestore): only test inboxes, no office alert
  const testMode = String(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test') && !process.env.FIRESTORE_EMULATOR_HOST;
  if (testMode && !allowed(data.customerEmail)) return { skipped: 'test mode, non-test address' };
  await outbox.doc(`pay-client-${sessionId}`).set({ template: 'paymentConfirmation', to: data.customerEmail, uid: uid || null, data, stopDripFor: data.customerEmail, source: 'stripe-webhook', createdAt: now });
  if (!testMode) await outbox.doc(`pay-office-${sessionId}`).set({ template: 'paymentAlert', to: 'office', replyTo: data.customerEmail, data, source: 'stripe-webhook', createdAt: now });
  return { queued: true, officeAlert: !testMode };
}

module.exports.queuePaymentEmails = queuePaymentEmails;
