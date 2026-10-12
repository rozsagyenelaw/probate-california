// Decisions 2026-10-12, point 6: what Stripe Checkout and the Stripe receipt say for every MyProbateCA line.
// node --test netlify/functions/test/stripe-text.test.js   (no network, no emulator)
const test = require('node:test');
const assert = require('node:assert');

process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_fake';
// Old saved prices must no longer be used, even when configured
process.env.STRIPE_PRICE_FULL_PROBATE = 'price_full_probate_saved';
process.env.STRIPE_PRICE_CONTESTED_HEARING = 'price_contested_saved';
const { createCheckout } = require('../lib/checkout');
const { stripeTextFor } = require('../lib/stripeText');

function captureStripe() {
  const calls = [];
  return { calls, checkout: { sessions: { create: async (cfg) => { calls.push(cfg); return { id: 'cs_test_capture', url: 'https://checkout.stripe.com/c/pay/cs_test_capture' }; } } },
    promotionCodes: { list: async () => ({ data: [] }) },
    prices: { retrieve: async () => { throw new Error('saved prices must not be looked up'); } } };
}
const email = 'rozsagyenelaw1+stripetext@gmail.com';
const FORBIDDEN = [/[–—]/, /\s-\s/, /over \$750,000/i, /11 phases/i, /\bphases?\b/i, /hour/i, /consult/i, /\bcall\b/i, /strategy/i, /unlimited/i, /specialist/i, /on your behalf/i, /attorney prepares all/i, /we file/i];
function checkText(t, where) {
  for (const s of [t.name, t.description || '']) for (const rx of FORBIDDEN) assert.ok(!rx.test(s), `${where}: "${s}" matches ${rx}`);
  assert.ok(t.name.length <= 250, `${where}: name too long`);
}

async function lines(params, settings = {}) {
  const s = captureStripe();
  await createCheckout(s, null, { paymentPlan: 'full', customerEmail: email, ...params }, settings);
  const cfg = s.calls[0];
  for (const li of cfg.line_items) assert.ok(li.price_data && !li.price, 'inline price only, never a saved Stripe price');
  return cfg;
}

test('full probate: each tier names its estate range and the limited service; small estates say the 10810 rule', async () => {
  const cases = [
    [80000000, 399500, 'Full Probate (estates up to $1,000,000)', /Flat fee for estates up to \$1,000,000\./],
    [150000000, 599500, 'Full Probate (estates from $1,000,000 to $2,000,000)', /Flat fee for estates from \$1,000,000 to \$2,000,000\./],
    [250000000, 799500, 'Full Probate (estates over $2,000,000)', /Flat fee for estates over \$2,000,000\./],
    [5000000, 200000, 'Full Probate (small estate fee)', /lower of our flat fee and the amount California law sets .*Probate Code section 10810/]
  ];
  for (const [v, cents, name, rx] of cases) {
    const cfg = await lines({ serviceType: 'full', estateValueCents: v });
    const pd = cfg.line_items[0].price_data;
    assert.strictEqual(pd.unit_amount, cents);
    assert.strictEqual(pd.product_data.name, name);
    assert.match(pd.product_data.description, rx);
    assert.match(pd.product_data.description, /You file them as the petitioner, representing yourself\./);
    assert.match(pd.product_data.description, /hearing appearance and the final accounting are separate options/);
    assert.strictEqual(pd.product_data.metadata.site, 'myprobateca');
    assert.strictEqual(cfg.payment_intent_data.description, name, 'payment description (dashboard, receipt) uses the same name');
    checkText(pd.product_data, name);
  }
  // the range picked on the account screen sets the tier before the questionnaire value is known
  const r = await lines({ serviceType: 'full', estateRange: 'over-2m' });
  assert.strictEqual(r.line_items[0].price_data.product_data.name, 'Full Probate (estates over $2,000,000)');
});

test('simplified, accounting, appearances, house sale and balances: corrected names and descriptions', async () => {
  const expect = [
    [{ serviceType: 'simplified' }, 'Simplified Probate (family home)', 249500],
    [{ serviceType: 'accounting_only', accountingAddon: 'simple' }, 'Simple Accounting (fewer than 50 transactions)', 99500],
    [{ serviceType: 'accounting_only', accountingAddon: 'complex' }, 'Complex Accounting (50 or more transactions)', 199500],
    [{ serviceType: 'court_appearance', courtAppearance: 'remote', hearing: { hearingDate: '2026-11-30' }, now: new Date('2026-10-12T17:00:00Z') }, 'Court Hearing Appearance ($500 per hearing, limited scope)', 50000],
    [{ serviceType: 'court_appearance', courtAppearance: 'contested', hearing: { hearingDate: '2026-11-30' }, now: new Date('2026-10-12T17:00:00Z') }, 'Contested Hearing Appearance ($600 per hearing, limited scope)', 60000],
    [{ serviceType: 'house_sale', houseSale: 'npa' }, 'House Sale Papers (Notice of Proposed Action)', 99500],
    [{ serviceType: 'house_sale', houseSale: 'confirmation' }, 'House Sale Papers (sale the court must confirm)', 149500],
    [{ serviceType: 'house_sale', houseSale: 'confirmation', houseSaleCount: 2 }, 'House Sale Papers (sale the court must confirm) (2 properties, $1,495 each)', 299000],
    [{ serviceType: 'fee_balance', balanceCents: 200000, balanceFor: 'fee' }, 'Full Probate fee balance (estate value from the inventory)', 200000],
    [{ serviceType: 'fee_balance', balanceCents: 100000, balanceFor: 'accounting' }, 'Accounting fee balance (50 or more transactions)', 100000],
    [{ serviceType: 'fee_balance', balanceCents: 300000, balanceFor: 'fee,accounting' }, 'Fee balance (fee tier and accounting)', 300000],
    [{ serviceType: 'fee_balance', balanceCents: 100000, balanceLabel: 'Accounting adjustment (more transactions than expected)' }, 'Accounting fee balance (50 or more transactions)', 100000]
  ];
  for (const [p, name, cents] of expect) {
    const cfg = await lines(p, { contestedHearing: { offered: true, price: 600 } });
    const pd = cfg.line_items[0].price_data;
    assert.strictEqual(pd.product_data.name, name);
    assert.strictEqual(pd.unit_amount, cents);
    assert.ok(pd.product_data.description && pd.product_data.description.length > 40, name + ' has a description');
    checkText(pd.product_data, name);
  }
  const contested = stripeTextFor({ key: 'contested_hearing' });
  assert.match(contested.description, /limited scope counsel/);
  assert.ok(!/2-hour|minimum|\$300/.test(contested.name + contested.description));
});

test('a full probate order with add-ons lists every line by its new name; 3 payments name the tier', async () => {
  const cfg = await lines({ serviceType: 'full', estateValueCents: 150000000, accountingAddon: 'simple', courtAppearance: 'remote' });
  assert.deepStrictEqual(cfg.line_items.map(l => l.price_data.product_data.name), ['Full Probate (estates from $1,000,000 to $2,000,000)', 'Simple Accounting (fewer than 50 transactions)', 'Court Hearing Appearance ($500 per hearing, limited scope)']);
  const s = captureStripe();
  await createCheckout(s, null, { serviceType: 'full', estateRange: '1m-to-2m', paymentPlan: 'installments', customerEmail: email }, { installmentExact: true });
  assert.strictEqual(s.calls[0].line_items[0].price_data.product_data.name, 'Full Probate (estates from $1,000,000 to $2,000,000) (3 monthly payments)');
});

// Item m: a court appearance fewer than 7 days before the hearing says so on the Stripe page and receipt
test('short notice appearance: Stripe name and description say it is confirmed within 1 business day or refunded', async () => {
  const s = captureStripe();
  await createCheckout(s, null, { paymentPlan: 'full', customerEmail: email, serviceType: 'court_appearance', courtAppearance: 'remote', hearing: { hearingDate: '2026-10-16' }, now: new Date('2026-10-12T17:00:00Z') }, {});
  const pd = s.calls[0].line_items[0].price_data;
  assert.strictEqual(pd.product_data.name, 'Court Hearing Appearance ($500 per hearing, limited scope), short notice');
  assert.match(pd.product_data.description, /Rozsa confirms within 1 business day; if she cannot appear on that date, this payment is refunded in full automatically\./);
  checkText({ name: pd.product_data.name, description: pd.product_data.description }, 'short notice');
});

// Item u2 (approved in writing, eighth message C): Complex Accounting says what happens with fewer than 50 transactions
test('Complex Accounting description: fewer than 50 transactions moves the fee to Simple and the difference is refunded', () => {
  const t = stripeTextFor({ key: 'complex_accounting' });
  assert.match(t.description, /If the records show fewer than 50, the fee moves to Simple Accounting and the difference is refunded, as confirmed by Rozsa\./);
  checkText(t, 'complex accounting');
});
