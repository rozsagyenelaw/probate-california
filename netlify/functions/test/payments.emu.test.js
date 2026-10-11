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

const { statutoryFeeCents, fullProbateFeeCents, estateValueFromIntake } = require('../lib/pricing');
const { computeCaseTrust } = require('../lib/trust');

test('small estates: full probate fee is the lower of $3,995 and the Probate Code 10810 amount', () => {
  // 10810(a): 4% of first $100,000, 3% next $100,000, 2% next $800,000 (leginfo, opened 2026-10-10)
  assert.strictEqual(statutoryFeeCents(5000000), 200000);      // $50,000 -> $2,000
  assert.strictEqual(statutoryFeeCents(10000000), 400000);     // $100,000 -> $4,000
  assert.strictEqual(statutoryFeeCents(20000000), 700000);     // $200,000 -> $7,000
  assert.strictEqual(statutoryFeeCents(100000000), 2300000);   // $1,000,000 -> $23,000
  assert.deepStrictEqual(fullProbateFeeCents(5000000), { cents: 200000, basis: '10810', tier: 'up-to-1m', estateValueCents: 5000000 });
  assert.strictEqual(fullProbateFeeCents(9987500).cents, 399500);   // $99,875 -> exactly $3,995
  assert.strictEqual(fullProbateFeeCents(9900000).cents, 396000);   // $99,000 -> $3,960
  assert.strictEqual(fullProbateFeeCents(50000000).cents, 399500);  // larger estates pay the flat fee
  assert.strictEqual(fullProbateFeeCents(0).cents, 399500);         // unknown value: flat fee
  assert.strictEqual(buildOrder({ serviceType: 'full', estateValueCents: 5000000 }, {}).totalCents, 200000);
  assert.strictEqual(buildOrder({ serviceType: 'simplified', estateValueCents: 5000000 }, {}).totalCents, 249500); // cap is for full probate only
  assert.deepStrictEqual(installmentSchedule(200000, { installmentExact: true }), [66667, 66667, 66666]);
  assert.strictEqual(estateValueFromIntake({ assets: { realProperty: [{ estimatedValue: '40,000' }], bankAccounts: [{ balance: '10000' }], investments: [], vehicles: [{ estimatedValue: '' }], otherAssets: [] } }), 5000000);
});

test('trust ledger: earned by stage, ready to move never above what is held for the client', () => {
  const caseDoc = { serviceType: 'full', feeStages: { petitionDelivered: '2026-10-20' } };
  const payments = [{ id: 'p1', serviceType: 'full', amountCents: 399500, totalPriceCents: 399500, description: 'Full Probate', date: '2026-10-10' }];
  let t = computeCaseTrust(caseDoc, payments, [], []);
  assert.strictEqual(t.percentEarned, 40);
  assert.strictEqual(t.earned.totalCents, 159800);
  assert.strictEqual(t.readyToMoveCents, 159800);
  t = computeCaseTrust(caseDoc, payments, [], [{ id: 't1', amountCents: 159800, date: '2026-10-21' }]);
  assert.strictEqual(t.readyToMoveCents, 0);
  assert.strictEqual(t.heldForClientCents, 239700);
  // installment plan with only payment 1 in: ready to move is capped by what was deposited
  const inst = [{ id: 'i1', serviceType: 'full', amountCents: 133167, totalPriceCents: 399500, installment: { number: 1, of: 3 }, description: 'Full Probate', date: '2026-10-10' }];
  t = computeCaseTrust({ serviceType: 'full', feeStages: { petitionDelivered: 'x', notesAnswered: 'y' } }, inst, [], []);
  assert.strictEqual(t.earned.probateCents, 239700);
  assert.strictEqual(t.readyToMoveCents, 133167);
  // simplified: 60 percent at the petition
  t = computeCaseTrust({ serviceType: 'simplified', feeStages: { petitionDelivered: 'x' } }, [{ id: 's', serviceType: 'simplified', amountCents: 249500, totalPriceCents: 249500, description: 'Simplified Probate' }], [], []);
  assert.strictEqual(t.earned.totalCents, 149700);
});

test('10810 caps ALL ordinary services of a full probate (fee + accounting + uncontested appearance), not contested, not simplified', () => {
  const o1 = buildOrder({ serviceType: 'full', estateValueCents: 5000000, accountingAddon: 'simple', courtAppearance: 'remote' }, {});
  assert.strictEqual(o1.totalCents, 200000);                                   // $50,000 estate: $2,000 for everything
  assert.deepStrictEqual(o1.lines.filter(l => l.included).map(l => l.key), ['simple_accounting', 'remote_appearance']);
  assert.strictEqual(buildOrder({ serviceType: 'full', estateValueCents: 9000000, accountingAddon: 'simple' }, {}).totalCents, 360000); // $90,000 -> $3,600 total
  assert.strictEqual(buildOrder({ serviceType: 'full', estateValueCents: 30000000, accountingAddon: 'complex', courtAppearance: 'remote' }, {}).totalCents, 649000); // under the cap: list prices
  assert.strictEqual(buildOrder({ serviceType: 'full', estateValueCents: 5000000, courtAppearance: 'contested' }, {}).totalCents, 260000); // contested is extra
  assert.strictEqual(buildOrder({ serviceType: 'simplified', estateValueCents: 5000000, accountingAddon: 'simple' }, {}).totalCents, 349000); // 13151: no cap
  // later add-ons count what was already charged
  assert.strictEqual(buildOrder({ serviceType: 'court_appearance', courtAppearance: 'remote', capContext: { fullProbate: true, estateValueCents: 5000000, priorOrdinaryCents: 200000 } }, {}).totalCents, 0);
  assert.strictEqual(buildOrder({ serviceType: 'accounting_addon', accountingAddon: 'simple', capContext: { fullProbate: true, estateValueCents: 12000000, priorOrdinaryCents: 399500 } }, {}).totalCents, 60500);
});

test('inventory lower than the intake estimate: refund due under 10810 is computed (Rozsa starts it)', () => {
  const t = computeCaseTrust({ serviceType: 'full', inventoryValueCents: 3000000, feeStages: {} }, [{ id: 'p', serviceType: 'full', amountCents: 200000, totalPriceCents: 200000, ordinaryCents: 200000 }], [], []);
  assert.strictEqual(t.capUnder10810Cents, 120000);
  assert.strictEqual(t.capRefundDueCents, 80000);
  const t2 = computeCaseTrust({ serviceType: 'full', inventoryValueCents: 3000000, feeStages: {} }, [{ id: 'p', serviceType: 'full', amountCents: 200000, totalPriceCents: 200000, ordinaryCents: 200000 }], [{ id: 'r', amountCents: 80000 }], []);
  assert.strictEqual(t2.capRefundDueCents, 0);
});

test('continued hearing: the paid appearance carries over to the new date with no new charge', () => {
  const { continueHearing } = require('../lib/hearings');
  const r = continueHearing([{ id: 'chk_1', date: '2026-11-09', time: '08:30', department: '5', appearance: { kind: 'remote', paid: true, amountCents: 50000, paymentId: 'cs1' } }], 'chk_1', { date: '2026-12-14', note: 'court continued it' }, 'now');
  assert.strictEqual(r.hearings[0].outcome, 'continued');
  assert.strictEqual(r.hearings[0].continuedTo, r.newId);
  const moved = r.hearings.find(h => h.id === r.newId);
  assert.strictEqual(moved.date, '2026-12-14');
  assert.strictEqual(moved.appearance.paid, true);
  assert.strictEqual(moved.appearance.paymentId, 'cs1');
  assert.strictEqual(moved.appearance.newChargeCents, 0);
  assert.throws(() => continueHearing([], 'x', { date: '2026-12-14' }), /not found/);
});

test('full probate price tiers by estate value (decisions section 28), with the small-estate rule below $1,000,000', () => {
  const f = (d) => fullProbateFeeCents(d * 100);
  assert.strictEqual(f(50000).cents, 200000);    // small estate: 10810 amount
  assert.strictEqual(f(500000).cents, 399500);
  assert.strictEqual(f(1000000).cents, 399500);  // "up to $1,000,000" includes $1,000,000
  assert.strictEqual(f(1000001).cents, 599500);
  assert.strictEqual(f(2000000).cents, 599500);
  assert.strictEqual(f(2000001).cents, 799500);
  assert.strictEqual(f(9000000).cents, 799500);
  assert.strictEqual(fullProbateFeeCents(0).needsEstateValue, true);
  assert.deepStrictEqual(installmentSchedule(599500, { installmentExact: true }), [199834, 199834, 199832]);
  assert.deepStrictEqual(installmentSchedule(799500, { installmentExact: true }), [266500, 266500, 266500]);
  assert.strictEqual(buildOrder({ serviceType: 'simplified', estateValueCents: 300000000 }, {}).totalCents, 249500); // simplified unchanged
});

test('full probate checkout refuses to start without the estate value (the fee depends on it)', async () => {
  const { createCheckout } = require('../lib/checkout');
  await assert.rejects(createCheckout({}, null, { serviceType: 'full', paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+x@gmail.com' }, {}), e => e.code === 'estate_value_required');
});

test('inventory puts the estate in another tier: refund or balance due for Rozsa to confirm', () => {
  const pay = (c) => [{ id: 'p', serviceType: 'full', amountCents: c, totalPriceCents: c, ordinaryCents: c }];
  let a = computeCaseTrust({ serviceType: 'full', inventoryValueCents: 150000000, feeStages: {} }, pay(399500), [], []).feeAdjustment;
  assert.deepStrictEqual([a.kind, a.amountCents, a.tierNow], ['balance', 200000, '1m-to-2m']);
  a = computeCaseTrust({ serviceType: 'full', inventoryValueCents: 90000000, feeStages: {} }, pay(599500), [], []).feeAdjustment;
  assert.deepStrictEqual([a.kind, a.amountCents], ['refund', 200000]);
  a = computeCaseTrust({ serviceType: 'full', inventoryValueCents: 5000000, feeStages: {} }, pay(399500), [], []).feeAdjustment;
  assert.deepStrictEqual([a.kind, a.amountCents], ['refund', 199500]);   // small estate: down to the 10810 amount
  a = computeCaseTrust({ serviceType: 'full', inventoryValueCents: 50000000, feeStages: {} }, pay(399500), [], []).feeAdjustment;
  assert.strictEqual(a.kind, 'none');
  // a confirmed balance paid later counts toward the fee
  a = computeCaseTrust({ serviceType: 'full', inventoryValueCents: 150000000, feeStages: {} }, [...pay(399500), { id: 'b', serviceType: 'fee_balance', amountCents: 200000, ordinaryCents: 200000 }], [], []).feeAdjustment;
  assert.strictEqual(a.kind, 'none');
});

test('house sale add-on: $995 (Notice of Proposed Action) or $1,495 (court confirmation) per property, outside the 10810 limit', () => {
  let o = buildOrder({ serviceType: 'full', estateValueCents: 5000000, houseSale: 'npa' }, {});
  assert.strictEqual(o.totalCents, 299500);        // $2,000 capped fee + $995 sale (not capped)
  assert.strictEqual(o.ordinaryCents, 200000);
  o = buildOrder({ serviceType: 'house_sale', houseSale: 'confirmation', houseSaleCount: 2, capContext: { fullProbate: true, estateValueCents: 5000000, priorOrdinaryCents: 200000 } }, {});
  assert.strictEqual(o.totalCents, 299000);        // still charged in full after the cap is used up
  assert.throws(() => buildOrder({ serviceType: 'house_sale' }, {}), /kind of house sale/);
  assert.strictEqual(require('../lib/businessDefaults').accountingTierRule, 'transactions');
});

test('accounting tier by ledger transactions: refund or charge for Rozsa to confirm, inside the 10810 limit for full probate', () => {
  const base = { serviceType: 'full', estateValueCents: 50000000, addOns: { accounting: 'simple' }, feeStages: {} };
  const pays = [{ id: 'p', serviceType: 'full', amountCents: 499000, totalPriceCents: 399500, ordinaryCents: 499000, addOns: { accounting: 'simple' } }];
  let a = computeCaseTrust({ ...base, ledgerTransactionCount: 72 }, pays, [], []).accountingAdjustment;
  assert.deepStrictEqual([a.shouldTier, a.kind, a.amountCents], ['complex', 'balance', 100000]);
  a = computeCaseTrust({ ...base, addOns: { accounting: 'complex' }, ledgerTransactionCount: 12 }, [{ ...pays[0], addOns: { accounting: 'complex' } }], [], []).accountingAdjustment;
  assert.deepStrictEqual([a.shouldTier, a.kind, a.amountCents], ['simple', 'refund', 100000]);
  a = computeCaseTrust({ ...base, ledgerTransactionCount: 30 }, pays, [], []).accountingAdjustment;
  assert.strictEqual(a.kind, 'none');
  // small estate: a balance cannot push ordinary services above the 10810 amount ($50,000 -> $2,000)
  a = computeCaseTrust({ ...base, estateValueCents: 5000000, ledgerTransactionCount: 80 }, [{ id: 'p', serviceType: 'full', amountCents: 200000, totalPriceCents: 200000, ordinaryCents: 200000, addOns: { accounting: 'simple' } }], [], []).accountingAdjustment;
  assert.strictEqual(a.amountCents, 0);
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

test('fee agreement (when switched on): checkout refused until this client signed it for this exact purchase', async () => {
  const { requireSignedFeeAgreement } = require('../lib/checkout');
  const email = `rozsagyenelaw1+fa${Date.now()}@gmail.com`;
  const order = buildOrder({ serviceType: 'full', estateValueCents: 5000000 }, {});
  const params = { serviceType: 'full', customerEmail: email, accountingAddon: null, courtAppearance: null, paymentPlan: 'full' };
  await assert.rejects(requireSignedFeeAgreement(db, { ...params, feeAgreementRequestId: null }, order), e => e.code === 'fee_agreement_required');
  const ref = db.collection('signatureRequests').doc('fa-' + Date.now());
  await ref.set({ kind: 'fee_agreement', stage: 'checkout', status: 'checkout_unsigned', clientEmail: email, order: { service: 'full', accountingAddon: null, courtAppearance: null, paymentPlan: 'full', estateValueCents: 5000000, feeCents: 200000, totalCents: 200000 } });
  await assert.rejects(requireSignedFeeAgreement(db, { ...params, feeAgreementRequestId: ref.id }, order), e => e.code === 'fee_agreement_required'); // not signed
  await ref.update({ status: 'signed' });
  await assert.rejects(requireSignedFeeAgreement(db, { ...params, customerEmail: 'rozsagyenelaw1+other@gmail.com', feeAgreementRequestId: ref.id }, order), e => e.code === 'fee_agreement_required'); // other client
  await assert.rejects(requireSignedFeeAgreement(db, { ...params, feeAgreementRequestId: ref.id }, buildOrder({ serviceType: 'full' }, {})), e => e.code === 'fee_agreement_required'); // different fee
  await assert.rejects(requireSignedFeeAgreement(db, { ...params, paymentPlan: 'installments', feeAgreementRequestId: ref.id }, order), e => e.code === 'fee_agreement_required'); // different plan
  assert.strictEqual(await requireSignedFeeAgreement(db, { ...params, feeAgreementRequestId: ref.id }, order), ref.id);
});

test('checkout.session.async_payment_succeeded is recorded like a completed checkout, once; foreign ones ignored', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake';
  const realStripe = require('stripe')('sk_test_fake');
  const wh = require('../stripe-webhook.js');
  wh._setStripeForTests(Object.assign(require('stripe')('sk_test_fake'), { checkout: { sessions: { listLineItems: async () => ({ data: [{ price: { id: 'p', product: { metadata: { site: 'myprobateca' } } } }] }) } } }));
  const email = `rozsagyenelaw1+w2pasync${Date.now()}@gmail.com`;
  const uid = 'async-' + Date.now();
  await db.collection('users').doc(uid).set({ email });
  const send = async (type, obj) => { const payload = JSON.stringify({ id: 'evt_' + Math.random(), object: 'event', type, data: { object: obj } }); return wh.handler({ httpMethod: 'POST', headers: { 'stripe-signature': realStripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test_fake' }) }, body: payload, isBase64Encoded: false }); };
  const s = { id: 'cs_test_async_' + uid, object: 'checkout.session', customer_email: email, amount_total: 399500, success_url: 'https://myprobateca.com/payment-success', livemode: false,
    metadata: { app: 'probate', site: 'myprobateca', serviceType: 'full', paymentPlan: 'full', userId: uid, estateValueCents: '50000000', ordinaryCents: '399500' } };
  let r = await send('checkout.session.completed', { ...s, payment_status: 'unpaid' });   // bank or Klarna still pending
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual((await db.collection('payments').doc(s.id).get()).exists, false);
  r = await send('checkout.session.async_payment_succeeded', { ...s, payment_status: 'paid' });
  assert.strictEqual((await db.collection('payments').doc(s.id).get()).data().amountCents, 399500);
  r = await send('checkout.session.async_payment_succeeded', { ...s, payment_status: 'paid' }); // repeat delivery
  assert.match(r.body, /duplicate/);
  assert.strictEqual((await db.collection('payments').where('stripeSessionId', '==', s.id).get()).size, 1);
  r = await send('checkout.session.async_payment_succeeded', { ...s, id: 'cs_test_async_foreign', success_url: 'https://livingtrustcalifornia.com/thank-you.html', metadata: { app: 'livingtrust' }, payment_status: 'paid' });
  assert.match(r.body, /not a MyProbateCA checkout/);
  assert.strictEqual((await db.collection('payments').doc('cs_test_async_foreign').get()).exists, false);
});

test('charge.refunded: recorded once on payment, case and refunds (repeat delivery changes nothing); other sites ignored', async () => {
  const { recordChargeRefunded } = require('../lib/recordPayment');
  const caseRef = await db.collection('cases').add({ userId: 'r1', serviceType: 'full', createdAt: admin.firestore.Timestamp.now() });
  const payRef = db.collection('payments').doc('cs_test_refund_' + Date.now());
  await payRef.set({ caseId: caseRef.id, userId: 'r1', amountCents: 399500, stripePaymentIntentId: 'pi_test_r1', refundedCents: 0 });
  const charge = { id: 'ch_test_r1', payment_intent: 'pi_test_r1', amount: 399500, amount_refunded: 50000, livemode: false, refunds: { data: [{ id: 're_test_r1', amount: 50000, status: 'succeeded', created: 1791700000, metadata: {} }] } };
  const stub = { charges: { retrieve: async () => charge }, invoices: { retrieve: async () => ({}) } };
  await recordChargeRefunded(stub, db, { id: 'ch_test_r1' });
  await recordChargeRefunded(stub, db, { id: 'ch_test_r1' });   // repeat
  assert.strictEqual((await payRef.get()).data().refundedCents, 50000);
  assert.strictEqual((await caseRef.get()).data().billing.totalRefunded, 50000);
  assert.strictEqual((await db.collection('refunds').doc('re_test_r1').get()).data().requestedBy, 'stripe-dashboard');
  const foreign = { ...charge, id: 'ch_test_lt', payment_intent: 'pi_livingtrust', refunds: { data: [{ id: 're_test_lt', amount: 100, status: 'succeeded', created: 1791700000, metadata: {} }] } };
  const r = await recordChargeRefunded({ charges: { retrieve: async () => foreign }, invoices: { retrieve: async () => ({}) } }, db, { id: 'ch_test_lt' });
  assert.strictEqual(r.matched, false);
  assert.strictEqual((await db.collection('refunds').doc('re_test_lt').get()).exists, false);
});
