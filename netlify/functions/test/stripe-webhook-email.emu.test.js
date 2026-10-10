// Stripe webhook -> mailOutbox (Firestore emulator only; fake keys, no network to Stripe).
// FIRESTORE_EMULATOR_HOST=127.0.0.1:8180 GCLOUD_PROJECT=demo-w2email node --test netlify/functions/test/stripe-webhook-email.emu.test.js
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

if (!process.env.FIRESTORE_EMULATOR_HOST || !/^demo-/.test(process.env.GCLOUD_PROJECT || '')) {
  test('needs the Firestore emulator', { skip: true }, () => {});
  return;
}

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: process.env.GCLOUD_PROJECT, client_email: 'fake@demo.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake';
const stripe = require('stripe')('sk_test_fake');
const { handler } = require('../stripe-webhook.js');
// (W2-payments) the webhook now checks line items against MyProbateCA prices; stub that one Stripe call
require('../stripe-webhook.js')._setStripeForTests(Object.assign(require('stripe')('sk_test_fake'), {
  checkout: { sessions: { listLineItems: async () => ({ data: [{ price: { id: 'price_x', product: { metadata: { site: 'myprobateca' } } } }] }) } }
}));
const admin = require(require.resolve('firebase-admin', { paths: [require('path').join(__dirname, '..')] }));
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });

test('checkout.session.completed queues the client and office emails, with the payer name', async () => {
  const db = admin.firestore();
  const email = 'rozsagyenelaw1+w2hook@gmail.com';
  await db.collection('users').doc('hookuser').set({ uid: 'hookuser', email, firstName: 'Tess', lastName: 'Hook' });
  const payload = JSON.stringify({ id: 'evt_test', object: 'event', type: 'checkout.session.completed', data: { object: {
    id: 'cs_test_w2hook', object: 'checkout.session', customer_email: email, amount_total: 399500,
    customer_details: { email, name: '' },
    success_url: 'https://myprobateca.com/payment-success?session_id={CHECKOUT_SESSION_ID}',
    metadata: { app: 'probate', site: 'myprobateca', serviceType: 'full', probateType: 'full', paymentPlan: 'full' }
  } } });
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test_fake' });
  const res = await handler({ httpMethod: 'POST', headers: { 'stripe-signature': sig }, body: payload, isBase64Encoded: false });
  assert.strictEqual(res.statusCode, 200);
  const c = (await db.collection('mailOutbox').doc('pay-client-cs_test_w2hook').get()).data();
  const o = (await db.collection('mailOutbox').doc('pay-office-cs_test_w2hook').get()).data();
  assert.strictEqual(c.template, 'paymentConfirmation');
  assert.strictEqual(c.to, email);
  assert.strictEqual(c.stopDripFor, email);
  assert.strictEqual(c.uid, 'hookuser');
  assert.strictEqual(c.data.customerName, 'Tess Hook');
  assert.match(c.data.orderNumber, /^#PCA\d{8}$/);
  assert.strictEqual(o.template, 'paymentAlert');
  assert.strictEqual(o.to, 'office');
  assert.strictEqual(o.replyTo, email);
});
