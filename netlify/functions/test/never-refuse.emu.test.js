// Item v (Rozsa, fourth message A2 and A5): a payment with no account or case lands on a new paid case made from the
// email (one email = one account), and the office is told what is missing. Firestore and Auth emulators, no Stripe.
// firebase emulators:exec --only firestore,auth "FIRESTORE_EMULATOR_HOST=... FIREBASE_AUTH_EMULATOR_HOST=... GCLOUD_PROJECT=demo-itemv node --test netlify/functions/test/never-refuse.emu.test.js"
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

const emu = !!process.env.FIRESTORE_EMULATOR_HOST && !!process.env.FIREBASE_AUTH_EMULATOR_HOST && /^demo-/.test(process.env.GCLOUD_PROJECT || '');
if (!emu) { test('needs the Firestore and Auth emulators', { skip: true }, () => {}); return; }
const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: process.env.GCLOUD_PROJECT, client_email: 'fake@demo.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
const { getDb, admin } = require('../lib/firebaseAdmin');
const { recordCheckout } = require('../lib/recordPayment');
const { queueOfficeFollowups } = require('../lib/paymentEmails');
const db = getDb();
const noStripe = {};
const session = (id, email, meta, amount, extra = {}) => ({ id, payment_status: 'paid', amount_total: amount, customer_email: email, livemode: false, customer_details: { email, name: 'Riley Navarro', phone: '310-555-0199' }, metadata: { app: 'probate', paymentPlan: 'full', ...meta }, ...extra });

test('a guest Full probate payment makes the account and a paid case with every question still open', async () => {
  const email = `rozsagyenelaw1+v-guest${Date.now()}@gmail.com`;
  const r = await recordCheckout(noStripe, db, session('cs_test_vg_' + Date.now(), email, { serviceType: 'full', feeCents: '599500', pricedFrom: 'range' }, 599500));
  assert.ok(r.uid, 'an account was made');
  assert.strictEqual(r.accountCreated, true);
  const au = await admin.auth().getUserByEmail(email);
  assert.strictEqual(au.uid, r.uid);
  const c = r.caseNow;
  assert.strictEqual(c.paymentStatus, 'paid');
  assert.strictEqual(c.status, 'intake_pending');
  assert.strictEqual(c.intakeCompletedAt, null);
  assert.strictEqual(c.feeChargedCents, 599500);
  assert.strictEqual(c.pricedFrom, 'range');
  assert.ok(c.questionsMissing.length >= 4);
  assert.strictEqual((await db.collection('users').doc(r.uid).get()).data().currentCaseId, r.caseId);
  // A second payment from the same email uses the same account (one email = one account)
  const r2 = await recordCheckout(noStripe, db, session('cs_test_vg2_' + Date.now(), email, { serviceType: 'court_appearance', courtAppearance: 'remote' }, 50000));
  assert.strictEqual(r2.uid, r.uid);
  assert.strictEqual(r2.accountCreated, false);

  // Office alerts: PAID, questions not finished (first payment) and ADD-ON, no package is NOT sent for the appearance,
  // because this client now has a paid package
  const q1 = await queueOfficeFollowups(db, { meta: { serviceType: 'full', pricedFrom: 'range' }, r, session: session('cs_test_alert1', email, {}, 599500) });
  assert.deepStrictEqual(q1.queued, ['office-paid-questions-cs_test_alert1']);
  const m1 = (await db.collection('mailOutbox').doc('office-paid-questions-cs_test_alert1').get()).data();
  assert.strictEqual(m1.template, 'paidQuestionsMissing');
  assert.strictEqual(m1.to, 'office');
  assert.strictEqual(m1.data.customerEmail, email);
  assert.strictEqual(m1.data.phone, '310-555-0199');
  assert.strictEqual(m1.data.amount, 599500);
  assert.ok(m1.data.missing.length >= 4);
  assert.strictEqual(m1.data.caseId, r.caseId);
  const q2 = await queueOfficeFollowups(db, { meta: { serviceType: 'court_appearance' }, r: r2, session: session('cs_test_alert2', email, {}, 50000) });
  assert.deepStrictEqual(q2.queued, []);
});

test('an add-on paid with no package is accepted and the office gets "ADD-ON, no package"', async () => {
  const email = `rozsagyenelaw1+v-addon${Date.now()}@gmail.com`;
  const r = await recordCheckout(noStripe, db, session('cs_test_va_' + Date.now(), email, { serviceType: 'accounting_addon', accountingAddon: 'simple' }, 99500));
  assert.ok(r.uid);
  assert.ok(r.payment && r.payment.email === email, 'the payment is recorded');
  const q = await queueOfficeFollowups(db, { meta: { serviceType: 'accounting_addon' }, r, session: session('cs_test_alert3', email, {}, 99500) });
  assert.deepStrictEqual(q.queued, ['office-addon-no-package-cs_test_alert3']);
  const m = (await db.collection('mailOutbox').doc('office-addon-no-package-cs_test_alert3').get()).data();
  assert.strictEqual(m.template, 'addonNoPackage');
  assert.strictEqual(m.data.hasCase, false);
});
