// Stripe webhook for MyProbateCA (shared Stripe account: only events with metadata.app === 'probate' are handled).
// Events: checkout.session.completed, checkout.session.async_payment_succeeded, invoice.paid, charge.refunded.
// Firestore writes: lib/recordPayment.js. Emails: lib/paymentEmails.js. 3-payment hard stop: lib/installments.js.
let stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDb } = require('./lib/firebaseAdmin');
const { isMyProbateCheckout } = require('./lib/origin');
const { recordCheckout, recordInvoicePaid, recordChargeRefunded } = require('./lib/recordPayment');
const { queuePaymentEmails } = require('./lib/paymentEmails');

const headers = { 'Content-Type': 'application/json' };
const ok = (extra = {}) => ({ statusCode: 200, headers, body: JSON.stringify({ received: true, ...extra }) });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  // Every event must carry a valid Stripe signature; nothing is processed otherwise
  if (!webhookSecret || !sig) {
    console.error('Rejected webhook: missing', !webhookSecret ? 'STRIPE_WEBHOOK_SECRET' : 'stripe-signature header');
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Webhook Error: missing signature' }) };
  }
  let stripeEvent;
  try {
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, headers, body: JSON.stringify({ error: `Webhook Error: ${err.message}` }) };
  }
  console.log('Received Stripe event:', stripeEvent.type, stripeEvent.id);

  let db;
  try { db = getDb(); } catch (e) {
    console.error('Firebase unavailable:', e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'storage unavailable' }) }; // Stripe retries
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed' || stripeEvent.type === 'checkout.session.async_payment_succeeded') {
      const session = stripeEvent.data.object;
      const meta = session.metadata || {};
      // Shared Stripe account: ignore anything that is not a MyProbateCA checkout (no write, no email)
      const origin = await isMyProbateCheckout(stripe, session);
      if (!origin.ok) { console.log('Ignored foreign checkout:', origin.reason); return ok({ skipped: 'not a MyProbateCA checkout' }); }
      if (session.payment_status === 'unpaid') return ok({ skipped: 'not paid yet' }); // async methods: handled on async_payment_succeeded
      const r = await recordCheckout(stripe, db, session);
      if (r.duplicate) return ok({ duplicate: true });
      const customerName = r.customerName || (session.customer_details && session.customer_details.name) || null;
      // Every purchase: client confirmation + office alert through the portal outbox (shared templates)
      await queuePaymentEmails(db, { meta, email: r.payment.email, customerName, amountCents: session.amount_total, orderNumber: r.payment.orderNumber, sessionId: session.id, uid: r.uid, description: r.description, hearing: r.hearing });
      console.log('Checkout recorded', session.id.slice(0, 12), r.description, r.stop ? JSON.stringify(r.stop) : '');
      return ok({ recorded: true });
    }

    if (stripeEvent.type === 'invoice.paid') {
      const r = await recordInvoicePaid(stripe, db, stripeEvent.data.object.id);
      console.log('invoice.paid', JSON.stringify(r));
      return ok(r);
    }

    if (stripeEvent.type === 'charge.refunded') {
      const ch = stripeEvent.data.object;
      const r = await recordChargeRefunded(stripe, db, ch);
      console.log('charge.refunded', JSON.stringify(r));
      return ok(r);
    }
  } catch (err) {
    console.error('Webhook handling error:', stripeEvent.type, err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'handler error' }) }; // Stripe retries
  }
  return ok();
};

// Tests only: swap in a stub Stripe client (emulator tests have no network to Stripe)
exports._setStripeForTests = (stub) => { stripe = stub; };
