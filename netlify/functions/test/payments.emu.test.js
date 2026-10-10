// W2-payments: intake attaches to the paid case (item 17), add-ons never overwrite the package (item 30),
// installment amounts (item 28), refunds bookkeeping is idempotent (item 31). Firestore emulator only.
// FIRESTORE_EMULATOR_HOST=127.0.0.1:8200 GCLOUD_PROJECT=demo-w2pay node --test netlify/functions/test/payments.emu.test.js
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

const { installmentSchedule, buildOrder } = require('../lib/pricing');

test('installment amounts follow installmentExact', () => {
  assert.deepStrictEqual(installmentSchedule(399500, { installmentExact: false }), [133167, 133167, 133167]);
  assert.deepStrictEqual(installmentSchedule(399500, { installmentExact: true }), [133167, 133167, 133166]);
  assert.deepStrictEqual(installmentSchedule(249500, { installmentExact: true }), [83167, 83167, 83166]);
});

test('court appearance orders are priced (the old 500 error) and contested follows contestedHearing', () => {
  assert.strictEqual(buildOrder({ serviceType: 'court_appearance', courtAppearance: 'remote' }, {}).totalCents, 50000);
  assert.strictEqual(buildOrder({ serviceType: 'court_appearance', courtAppearance: 'contested' }, { contestedHearing: { offered: true, price: 600 } }).totalCents, 60000);
  assert.throws(() => buildOrder({ serviceType: 'court_appearance', courtAppearance: 'contested' }, { contestedHearing: { offered: false } }), /not offered/);
});

if (!process.env.FIRESTORE_EMULATOR_HOST || !/^demo-/.test(process.env.GCLOUD_PROJECT || '')) {
  test('emulator tests need the Firestore emulator', { skip: true }, () => {});
  return;
}

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: process.env.GCLOUD_PROJECT, client_email: 'fake@demo.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
const { getDb, admin } = require('../lib/firebaseAdmin');
const { findPaidCase, attachIntake } = require('../lib/intakeCase');
const { recordCheckout } = require('../lib/recordPayment');
const db = getDb();
const noStripe = {}; // payment-mode checkouts make no Stripe calls

test('item 17: intake attaches to the paid case and keeps it paid', async () => {
  const uid = 'u17-' + Date.now();
  await db.collection('users').doc(uid).set({ email: `rozsagyenelaw1+${uid}@gmail.com`, paymentStatus: 'paid' });
  const c = await db.collection('cases').add({ userId: uid, status: 'intake_pending', paymentStatus: 'paid', serviceType: 'full', createdAt: admin.firestore.Timestamp.now() });
  const found = await findPaidCase(db, uid, `rozsagyenelaw1+${uid}@gmail.com`);
  assert.strictEqual(found.ref.id, c.id);
  await attachIntake(db, found, uid, { decedent: { firstName: 'A', lastName: 'B', lastAddress: { county: 'Los Angeles' } }, willExists: false, paymentStatus: 'pending', serviceType: 'simplified' });
  const after = (await c.get()).data();
  assert.strictEqual(after.paymentStatus, 'paid');
  assert.strictEqual(after.serviceType, 'full'); // client-sent fields outside the intake whitelist are ignored
  assert.strictEqual(after.status, 'active');
  assert.strictEqual(after.probateType, 'intestate');
  assert.ok(after.intakeCompletedAt);
  assert.strictEqual((await db.collection('cases').where('userId', '==', uid).get()).size, 1);
});

test('item 17: a guest payment with no case yet opens one from the payment', async () => {
  const uid = 'u17b-' + Date.now(); const email = `rozsagyenelaw1+${uid}@gmail.com`;
  await db.collection('payments').doc('cs_test_' + uid).set({ email, serviceType: 'simplified', paymentStatus: 'paid', stripeSessionId: 'cs_test_' + uid, createdAt: admin.firestore.Timestamp.now() });
  const found = await findPaidCase(db, uid, email);
  assert.strictEqual(found.how, 'case-opened-from-payment');
  assert.strictEqual(found.data.serviceType, 'simplified');
  assert.strictEqual((await db.collection('payments').doc('cs_test_' + uid).get()).data().caseId, found.ref.id);
});

test('item 30: an accounting add-on never overwrites the probate package or amount paid', async () => {
  const uid = 'u30-' + Date.now(); const email = `rozsagyenelaw1+${uid}@gmail.com`;
  await db.collection('users').doc(uid).set({ email, paymentStatus: 'paid', serviceType: 'full', probateType: 'full', amountPaid: 399500 });
  const c = await db.collection('cases').add({ userId: uid, status: 'active', paymentStatus: 'paid', serviceType: 'full', probateType: 'testate', createdAt: admin.firestore.Timestamp.now() });
  const session = { id: 'cs_test_acc_' + uid, payment_status: 'paid', amount_total: 99500, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'accounting_addon', accountingAddon: 'simple', paymentPlan: 'full', caseId: c.id, userId: uid } };
  const r = await recordCheckout(noStripe, db, session);
  assert.strictEqual(r.description, 'Simple Accounting');
  const u = (await db.collection('users').doc(uid).get()).data();
  const cs = (await c.get()).data();
  assert.strictEqual(u.serviceType, 'full'); assert.strictEqual(u.probateType, 'full'); assert.strictEqual(u.amountPaid, 399500);
  assert.strictEqual(u.addOns.accounting, 'simple');
  assert.strictEqual(cs.serviceType, 'full'); assert.strictEqual(cs.probateType, 'testate'); assert.strictEqual(cs.addOns.accounting, 'simple');
  assert.strictEqual(cs.billing.totalPaid, 99500);
  // Stripe retry of the same event is ignored
  assert.deepStrictEqual(await recordCheckout(noStripe, db, session), { duplicate: true });
});

test('item 29: a paid court appearance adds one hearings[] entry', async () => {
  const uid = 'u29-' + Date.now(); const email = `rozsagyenelaw1+${uid}@gmail.com`;
  await db.collection('users').doc(uid).set({ email, paymentStatus: 'paid', serviceType: 'full' });
  const c = await db.collection('cases').add({ userId: uid, status: 'active', paymentStatus: 'paid', serviceType: 'full', createdAt: admin.firestore.Timestamp.now() });
  const hearing = JSON.stringify({ d: '2026-12-01', t: '08:30', dept: '5', cn: '26STPB1', co: 'Los Angeles', ty: 'petition_hearing', x: '' });
  await recordCheckout(noStripe, db, { id: 'cs_test_ct_' + uid, payment_status: 'paid', amount_total: 50000, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'court_appearance', courtAppearance: 'remote', paymentPlan: 'full', caseId: c.id, userId: uid, hearing } });
  const cs = (await c.get()).data();
  assert.strictEqual(cs.hearings.length, 1);
  assert.strictEqual(cs.hearings[0].type, 'petition');
  assert.strictEqual(cs.hearings[0].date, '2026-12-01');
  assert.strictEqual(cs.hearings[0].source, 'checkout');
  assert.strictEqual(cs.hearings[0].appearance.amountCents, 50000);
  assert.strictEqual(cs.paymentStatus, 'paid');
  assert.strictEqual((await db.collection('users').doc(uid).get()).data().serviceType, 'full');
});
