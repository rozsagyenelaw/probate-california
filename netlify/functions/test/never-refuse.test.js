// Item v (Rozsa, fourth message A, 2026-10-12): WE NEVER REFUSE A PAYMENT.
// node --test netlify/functions/test/never-refuse.test.js   (no network, no emulator)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_fake';
const { createCheckout } = require('../lib/checkout');
const { missingQuestions, missingLines, answersComplete, feeBasisFor } = require('../lib/questions');

const done = {
  decedent: { firstName: 'Eleanor', lastName: 'Ellison', dateOfDeath: '2025-11-03', maritalStatus: 'widowed', lastAddress: { street: '418 Oak Knoll Ave', city: 'Glendora', county: 'Los Angeles' } },
  petitioner: { firstName: 'Morgan', lastName: 'Ellison', relationship: 'child', phone: '626-555-0142', email: 'rozsagyenelaw1+v@gmail.com', address: { street: '22 Foothill Blvd', city: 'Glendora', zip: '91741' } },
  willExists: false, heirs: [{ name: 'Morgan Ellison' }],
  assets: { realProperty: [{ propertyType: 'primary_residence', address: '418 Oak Knoll Ave', estimatedValue: '650000' }] }
};
const stub = () => { const calls = []; return { calls, checkout: { sessions: { create: async (cfg) => { calls.push(cfg); return { id: 'cs_test_v', url: 'https://checkout.stripe.com/c/pay/cs_test_v' }; } } }, promotionCodes: { list: async () => ({ data: [] }) } }; };

test('no refusal code is left in the purchase paths', () => {
  for (const f of ['create-checkout-session.js', 'submit-intake.js']) {
    const src = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert.doesNotMatch(src, /start_your_case|questions_not_done|simplified_not_eligible|home_value_missing/, f);
  }
});

test('missing questions are listed page by page; complete answers have none', () => {
  assert.strictEqual(answersComplete(done), true);
  const partial = { ...done, decedent: { ...done.decedent, dateOfDeath: '', lastAddress: { ...done.decedent.lastAddress, county: '' } }, willExists: null,
    assets: { realProperty: [{ propertyType: 'primary_residence', address: '418 Oak Knoll Ave', estimatedValue: '' }], bankAccounts: [{ balance: '40000' }] } };
  assert.deepStrictEqual(missingLines(partial), ['The person who passed away: Date of death, County', 'The will: Is there a will? (yes or no)', 'House and land: The value of the home at 418 Oak Knoll Ave']);
  assert.strictEqual(missingQuestions({}).length, 4, 'no answers: every required page is listed');
});

test('incomplete answers are never priced from partial values: the first-screen range decides', () => {
  const partial = { ...done, assets: { realProperty: [{ propertyType: 'primary_residence', estimatedValue: '' }], bankAccounts: [{ balance: '40000' }] } };
  assert.deepStrictEqual(feeBasisFor({ formData: partial, estateRange: '1m-to-2m', answersValueCents: 4000000 }), { use: 'range', estateValueCents: null, estateRange: '1m-to-2m', flag: 'questions-missing' });
  assert.deepStrictEqual(feeBasisFor({ formData: partial, estateRange: null, answersValueCents: null }), { use: 'default', estateValueCents: null, estateRange: 'up-to-1m', flag: 'no-estate-range' });
  assert.deepStrictEqual(feeBasisFor({ formData: done, estateRange: '1m-to-2m', answersValueCents: 65000000 }), { use: 'answers', estateValueCents: 65000000, estateRange: null, flag: null });
});

test('the checkout charges the range tier and records how it was priced', async () => {
  const s = stub();
  await createCheckout(s, null, { serviceType: 'full', probateType: 'full', estateRange: '1m-to-2m', pricedFrom: 'range', paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+v@gmail.com' }, {});
  const cfg = s.calls[0];
  assert.strictEqual(cfg.line_items[0].price_data.unit_amount, 599500);
  assert.strictEqual(cfg.metadata.feeCents, '599500');
  assert.strictEqual(cfg.metadata.pricedFrom, 'range');
});
