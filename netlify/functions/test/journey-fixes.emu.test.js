// Item i (W6 journey run 2 fixes), main-site payment functions. Unit tests run anywhere; the rest need the Firestore emulator.
// FIRESTORE_EMULATOR_HOST=127.0.0.1:8540 GCLOUD_PROJECT=demo-fixi node --test netlify/functions/test/journey-fixes.emu.test.js
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_fake';
const { createCheckout } = require('../lib/checkout');
const { confirmedBalance } = require('../create-checkout-session');

// A Stripe stand-in that records the Checkout Session it is asked to create (no network)
function captureStripe() {
  const calls = [];
  return { calls, checkout: { sessions: { create: async (cfg) => { calls.push(cfg); return { id: 'cs_test_capture', url: 'https://checkout.stripe.com/c/pay/cs_test_capture' }; } } }, promotionCodes: { list: async () => ({ data: [] }) } };
}

test('R9/R18: the 3-payment plan says next to the pay button that it is not a subscription and stops after the third payment', async () => {
  const s = captureStripe();
  await createCheckout(s, null, { serviceType: 'full', estateRange: 'up-to-1m', paymentPlan: 'installments', customerEmail: 'rozsagyenelaw1+i@gmail.com' }, { installmentExact: true });
  const cfg = s.calls[0];
  assert.strictEqual(cfg.mode, 'subscription');
  assert.match(cfg.custom_text.submit.message, /3-payment plan, not a subscription: \$1,331\.67 today, then \$1,331\.67 and \$1,331\.66/);
  assert.match(cfg.custom_text.submit.message, /\$3,995\.00 in all\. It stops by itself after the third payment\./);
  assert.ok(!/[–—]/.test(cfg.custom_text.submit.message), 'no em or en dashes');
  assert.ok(cfg.custom_text.submit.message.length <= 1200);
});

test('F33/F35: a service added from the client home returns to the client home, with the picked hearing and balance kind in metadata', async () => {
  const s = captureStripe();
  await createCheckout(s, null, { serviceType: 'court_appearance', courtAppearance: 'remote', hearing: { hearingDate: '2026-11-30' }, hearingId: 'office1', now: new Date('2026-10-12T17:00:00Z'), paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+i@gmail.com', caseId: 'c1', successQuery: 'next=portal&kind=addon', cancelPath: '/add-service' }, {});
  const cfg = s.calls[0];
  assert.match(cfg.success_url, /&next=portal&kind=addon$/);
  assert.strictEqual(cfg.cancel_url, 'https://myprobateca.com/add-service');
  assert.strictEqual(cfg.metadata.hearingId, 'office1');
  assert.strictEqual(cfg.custom_text, undefined, 'one-time payments keep the normal button text');
  const s2 = captureStripe();
  await createCheckout(s2, null, { serviceType: 'fee_balance', balanceCents: 200000, balanceFor: 'fee', paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+i@gmail.com', caseId: 'c1' }, {});
  assert.strictEqual(s2.calls[0].metadata.balanceFor, 'fee');
  assert.strictEqual(s2.calls[0].line_items[0].price_data.unit_amount, 200000);
});

test('N6: the balance a client can pay online is only what Rozsa confirmed and made visible, never paid twice', () => {
  assert.deepStrictEqual(confirmedBalance({}).cents, 0);
  const fee = { status: 'confirmed', clientVisible: true, kind: 'balance', deltaCents: 200000 };
  assert.strictEqual(confirmedBalance({ feeTierChange: fee }).cents, 200000);
  assert.deepStrictEqual(confirmedBalance({ feeTierChange: fee }).keys, ['fee']);
  assert.strictEqual(confirmedBalance({ feeTierChange: { ...fee, paid: true } }).cents, 0);
  assert.strictEqual(confirmedBalance({ feeTierChange: { ...fee, clientVisible: false } }).cents, 0);
  assert.strictEqual(confirmedBalance({ feeTierChange: { ...fee, kind: 'refund', deltaCents: -200000 } }).cents, 0);
  const acct = { status: 'confirmed', clientVisible: true, kind: 'charge', deltaCents: 100000 };
  const both = confirmedBalance({ feeTierChange: fee, accountingTierChange: acct });
  assert.strictEqual(both.cents, 300000);
  assert.deepStrictEqual(both.keys, ['fee', 'accounting']);
});

if (!process.env.FIRESTORE_EMULATOR_HOST || !/^demo-/.test(process.env.GCLOUD_PROJECT || '')) {
  test('emulator tests need the Firestore emulator', { skip: true }, () => {});
  return;
}

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: process.env.GCLOUD_PROJECT, client_email: 'fake@demo.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
const { getDb, admin } = require('../lib/firebaseAdmin');
const { recordCheckout, recordIncluded } = require('../lib/recordPayment');
const db = getDb();
const noStripe = {};
const now = () => admin.firestore.Timestamp.now();

test('F18: answers sent, then paid in full: the case moves from pending_payment to active at once', async () => {
  const uid = 'iF18a-' + Date.now(); const email = `rozsagyenelaw1+${uid}@gmail.com`;
  await db.collection('users').doc(uid).set({ email });
  const c = await db.collection('cases').add({ userId: uid, status: 'pending_payment', paymentStatus: 'pending', serviceType: 'full', intakeCompletedAt: now(), createdAt: now() });
  const r = await recordCheckout(noStripe, db, { id: 'cs_test_f18a_' + uid, payment_status: 'paid', amount_total: 399500, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'full', paymentPlan: 'full', caseId: c.id, userId: uid } });
  const cs = (await c.get()).data();
  assert.strictEqual(cs.status, 'active');
  assert.strictEqual(cs.paymentStatus, 'paid');
  assert.strictEqual(r.intakeDone, true);
});

test('F18: the 3-payment plan also leaves pending_payment; a paid case without answers is intake_pending; closed stays closed', async () => {
  const uid = 'iF18b-' + Date.now(); const email = `rozsagyenelaw1+${uid}@gmail.com`;
  await db.collection('users').doc(uid).set({ email });
  const c = await db.collection('cases').add({ userId: uid, status: 'pending_payment', paymentStatus: 'pending', serviceType: 'full', intakeCompletedAt: now(), createdAt: now() });
  await recordCheckout(noStripe, db, { id: 'cs_test_f18b_' + uid, payment_status: 'paid', amount_total: 133167, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'full', paymentPlan: 'installments', installmentAmounts: '133167,133167,133166', caseId: c.id, userId: uid } });
  assert.strictEqual((await c.get()).data().status, 'active');
  assert.strictEqual((await c.get()).data().paymentStatus, 'installments_active');

  const c2 = await db.collection('cases').add({ userId: uid, status: 'pending_payment', serviceType: 'simplified', createdAt: now() });
  const r2 = await recordCheckout(noStripe, db, { id: 'cs_test_f18c_' + uid, payment_status: 'paid', amount_total: 249500, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'simplified', paymentPlan: 'full', caseId: c2.id, userId: uid } });
  assert.strictEqual((await c2.get()).data().status, 'intake_pending');
  assert.strictEqual(r2.intakeDone, false);

  const c3 = await db.collection('cases').add({ userId: uid, status: 'closed', serviceType: 'full', intakeCompletedAt: now(), createdAt: now() });
  await recordCheckout(noStripe, db, { id: 'cs_test_f18d_' + uid, payment_status: 'paid', amount_total: 399500, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'full', paymentPlan: 'full', caseId: c3.id, userId: uid } });
  assert.strictEqual((await c3.get()).data().status, 'closed');
});

test('F18: an add-on payment never changes the case status', async () => {
  const uid = 'iF18e-' + Date.now(); const email = `rozsagyenelaw1+${uid}@gmail.com`;
  await db.collection('users').doc(uid).set({ email });
  const c = await db.collection('cases').add({ userId: uid, status: 'pending_payment', serviceType: 'full', createdAt: now() });
  await recordCheckout(noStripe, db, { id: 'cs_test_f18e_' + uid, payment_status: 'paid', amount_total: 99500, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'accounting_addon', accountingAddon: 'simple', paymentPlan: 'full', caseId: c.id, userId: uid } });
  assert.strictEqual((await c.get()).data().status, 'pending_payment');
});

test('N6: a confirmed balance paid online is marked paid on the case', async () => {
  const uid = 'iN6-' + Date.now(); const email = `rozsagyenelaw1+${uid}@gmail.com`;
  await db.collection('users').doc(uid).set({ email });
  const c = await db.collection('cases').add({ userId: uid, status: 'active', paymentStatus: 'paid', serviceType: 'full', createdAt: now(),
    feeTierChange: { status: 'confirmed', clientVisible: true, kind: 'balance', deltaCents: 200000 } });
  await recordCheckout(noStripe, db, { id: 'cs_test_n6_' + uid, payment_status: 'paid', amount_total: 200000, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'fee_balance', paymentPlan: 'full', caseId: c.id, userId: uid, balanceFor: 'fee' } });
  const cs = (await c.get()).data();
  assert.strictEqual(cs.feeTierChange.paid, true);
  assert.strictEqual(cs.feeTierChange.paymentId, 'cs_test_n6_' + uid);
  assert.strictEqual(cs.feeTierChange.deltaCents, 200000, 'the confirmed record itself is kept');
  assert.strictEqual(cs.paymentStatus, 'paid');
});

test('F38: the appearance bought for a hearing picked in the client home goes on that hearing (one entry, not two)', async () => {
  const uid = 'iF38-' + Date.now(); const email = `rozsagyenelaw1+${uid}@gmail.com`;
  await db.collection('users').doc(uid).set({ email });
  const c = await db.collection('cases').add({ userId: uid, status: 'active', paymentStatus: 'paid', serviceType: 'full', createdAt: now(),
    hearings: [{ id: 'office1', type: 'petition', date: '2026-11-30', time: '08:30', department: '11', source: 'admin', appearanceRequested: false, outcome: '' }] });
  const hearing = JSON.stringify({ d: '2026-11-30', t: '08:30', dept: '11', cn: '26STPB1', co: 'Los Angeles', ty: 'petition', x: '' });
  await recordCheckout(noStripe, db, { id: 'cs_test_f38_' + uid, payment_status: 'paid', amount_total: 50000, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'court_appearance', courtAppearance: 'remote', paymentPlan: 'full', caseId: c.id, userId: uid, hearing, hearingId: 'office1' } });
  const cs = (await c.get()).data();
  assert.strictEqual(cs.hearings.length, 1);
  assert.strictEqual(cs.hearings[0].id, 'office1');
  assert.strictEqual(cs.hearings[0].appearance.paid, true);
  assert.strictEqual(cs.hearings[0].appearance.paymentId, 'cs_test_f38_' + uid);
  // included under the 10810 limit: same, on the picked entry
  const c2 = await db.collection('cases').add({ userId: uid, status: 'active', serviceType: 'full', createdAt: now(), hearings: [{ id: 'h2', date: '2026-12-01', outcome: '' }] });
  await recordIncluded(db, { caseId: c2.id, userId: uid, email, serviceType: 'court_appearance', courtAppearance: 'remote', hearing: { hearingDate: '2026-12-01' }, hearingId: 'h2', order: { lines: [] } });
  const cs2 = (await c2.get()).data();
  assert.strictEqual(cs2.hearings.length, 1);
  assert.strictEqual(cs2.hearings[0].appearance.includedUnder10810, true);
});
