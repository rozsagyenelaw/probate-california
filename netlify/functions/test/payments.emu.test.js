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

test('shared Stripe account: foreign checkouts are ignored with 200, no write and no email', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake';
  process.env.STRIPE_PRICE_FULL_PROBATE = 'price_full_probate_test';
  const realStripe = require('stripe')('sk_test_fake');
  const wh = require('../stripe-webhook.js');
  let lineItems = [];
  wh._setStripeForTests(Object.assign(require('stripe')('sk_test_fake'), { checkout: { sessions: { listLineItems: async () => ({ data: lineItems }) } } }));
  const email = 'rozsagyenelaw1+w2pforeign@gmail.com';
  await db.collection('users').doc('foreignuser').set({ email, paymentStatus: 'none' });
  const base = { object: 'checkout.session', payment_status: 'paid', amount_total: 67500, customer_email: email, customer_details: { email, name: 'Foreign Buyer' } };
  const cases = [
    { name: 'living trust order without metadata', s: { ...base, id: 'cs_test_f1', success_url: 'https://livingtrustcalifornia.com/thank-you.html', metadata: {} } },
    { name: 'living trust order (app livingtrust)', s: { ...base, id: 'cs_test_f2', success_url: 'https://livingtrustcalifornia.com/thank-you.html', metadata: { app: 'livingtrust', basePackage: 'joint_trust' } } },
    { name: 'app probate but another site success_url', s: { ...base, id: 'cs_test_f3', success_url: 'https://livingtrustcalifornia.com/thank-you.html', metadata: { app: 'probate', serviceType: 'full' } } },
    { name: 'site tag but another site in metadata', s: { ...base, id: 'cs_test_f4', success_url: 'https://myprobateca.com/payment-success', metadata: { app: 'probate', site: 'livingtrust', serviceType: 'full' } } },
    { name: 'MyProbateCA tags but a foreign price (Joint Trust Plan)', items: [{ price: { id: 'price_joint_trust', product: { metadata: {} } } }], s: { ...base, id: 'cs_test_f5', success_url: 'https://myprobateca.com/payment-success', metadata: { app: 'probate', site: 'myprobateca', serviceType: 'full', paymentPlan: 'full', userId: 'foreignuser' } } }
  ];
  for (const c of cases) {
    lineItems = c.items || [];
    const payload = JSON.stringify({ id: 'evt_' + c.s.id, object: 'event', type: 'checkout.session.completed', data: { object: c.s } });
    const sig = realStripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test_fake' });
    const res = await wh.handler({ httpMethod: 'POST', headers: { 'stripe-signature': sig }, body: payload, isBase64Encoded: false });
    assert.strictEqual(res.statusCode, 200, c.name);
    assert.match(res.body, /not a MyProbateCA checkout/, c.name);
    assert.strictEqual((await db.collection('payments').doc(c.s.id).get()).exists, false, c.name + ': no payment row');
    assert.strictEqual((await db.collection('mailOutbox').doc('pay-client-' + c.s.id).get()).exists, false, c.name + ': no email');
  }
  assert.strictEqual((await db.collection('users').doc('foreignuser').get()).data().paymentStatus, 'none');
  assert.strictEqual((await db.collection('accountRequests').where('email', '==', email).get()).size, 0);
  // and a real MyProbateCA price passes
  lineItems = [{ price: { id: 'price_full_probate_test', product: {} } }];
  const ok = { ...base, id: 'cs_test_ok1', amount_total: 399500, success_url: 'https://myprobateca.com/payment-success', metadata: { app: 'probate', site: 'myprobateca', serviceType: 'full', paymentPlan: 'full', userId: 'foreignuser' } };
  const payload = JSON.stringify({ id: 'evt_ok1', object: 'event', type: 'checkout.session.completed', data: { object: ok } });
  const res = await wh.handler({ httpMethod: 'POST', headers: { 'stripe-signature': realStripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test_fake' }) }, body: payload, isBase64Encoded: false });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual((await db.collection('payments').doc('cs_test_ok1').get()).exists, true);
});
