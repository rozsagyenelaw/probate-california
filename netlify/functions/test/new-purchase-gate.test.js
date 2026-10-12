// Item q (Rozsa, point 10 approved in writing 2026-10-12): no new probate purchase outside the approved order.
// node --test netlify/functions/test/new-purchase-gate.test.js   (no network, no emulator)
const test = require('node:test');
const assert = require('node:assert');
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_fake';
delete process.env.FIREBASE_SERVICE_ACCOUNT; // no database: the gate must answer before anything else
const { checkNewPurchase, questionsDone, REFUSAL } = require('../lib/newPurchase');
const { createCheckout } = require('../lib/checkout');

const done = { decedent: { firstName: 'Eleanor', lastName: 'Ellison', dateOfDeath: '2025-11-03' }, petitioner: { firstName: 'Morgan', lastName: 'Ellison' }, willExists: true, heirs: [{ name: 'Morgan Ellison' }] };

test('new Simplified, Full and Accounting-only purchases need a signed-in client case with the questions done', () => {
  for (const serviceType of ['simplified', 'full', 'accounting_only']) {
    assert.strictEqual(checkNewPurchase({ serviceType, caller: null, caseDoc: null }).ok, false);
    assert.strictEqual(checkNewPurchase({ serviceType, caller: { uid: 'u' }, caseDoc: null }).ok, false);
    assert.strictEqual(checkNewPurchase({ serviceType, caller: { uid: 'u' }, caseDoc: { userId: 'u' } }).ok, false, 'questions not done');
    assert.strictEqual(checkNewPurchase({ serviceType, caller: { uid: 'u' }, caseDoc: { userId: 'u', intakeCompletedAt: new Date() } }).ok, true);
  }
});

test('add-ons, balances and appearances are not new purchases', () => {
  for (const serviceType of ['accounting_addon', 'court_appearance', 'house_sale', 'balance_due']) assert.strictEqual(checkNewPurchase({ serviceType, caller: null, caseDoc: null }).ok, true);
});

test('the refusal is plain, points to Start your case and Continue your case, and has no dashes', () => {
  assert.match(REFUSAL.error, /Start your case/); assert.match(REFUSAL.error, /Continue your case/);
  assert.doesNotMatch(REFUSAL.error, /[–—]|consult/i);
  assert.strictEqual(REFUSAL.startUrl, 'https://portal.myprobateca.com/start');
});

test('questions done: the essentials every petition needs', () => {
  assert.strictEqual(questionsDone(done), true);
  assert.strictEqual(questionsDone({ ...done, heirs: [] }), false);
  assert.strictEqual(questionsDone({ ...done, willExists: null }), false);
  assert.strictEqual(questionsDone({ ...done, decedent: { ...done.decedent, dateOfDeath: '' } }), false);
  assert.strictEqual(questionsDone({}), false);
});

test('create-checkout-session refuses a guest Full purchase before any Stripe call', async () => {
  const { handler } = require('../create-checkout-session');
  const r = await handler({ httpMethod: 'POST', headers: { origin: 'https://myprobateca.com' }, body: JSON.stringify({ serviceType: 'full', paymentPlan: 'full', estateRange: 'up-to-1m', customerEmail: 'rozsagyenelaw1+q@gmail.com' }) });
  assert.strictEqual(r.statusCode, 403);
  assert.strictEqual(JSON.parse(r.body).code, 'start_your_case');
});

test('Stripe Back without a client home return goes to the client home, never /payment', async () => {
  const calls = [];
  const s = { checkout: { sessions: { create: async (cfg) => { calls.push(cfg); return { id: 'cs_test_q', url: 'https://checkout.stripe.com/c/pay/cs_test_q' }; } } }, promotionCodes: { list: async () => ({ data: [] }) } };
  await createCheckout(s, null, { serviceType: 'house_sale', houseSale: 'npa', paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+q@gmail.com' }, {});
  assert.strictEqual(calls[0].cancel_url, 'https://portal.myprobateca.com/?tab=payments');
  assert.doesNotMatch(calls[0].cancel_url, /\/payment\b/);
});
