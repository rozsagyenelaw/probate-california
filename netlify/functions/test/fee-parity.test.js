// One fee for every surface: checkout (lib/pricing.js), the payment pages (src/services/businessSettings.js) and the
// cockpit (portal functions/shared/feeTiers.mjs, copied to test/fixtures by scripts/sync-fee-tiers.sh) must agree.
// node --test netlify/functions/test/fee-parity.test.js
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const pricing = require('../lib/pricing');
const { computeCaseTrust } = require('../lib/trust');

const VALUES = [1, 10000, 2500000, 5000000, 9900000, 9987500, 9987600, 50000000, 99999900, 100000000, 100000100, 150000000, 199999900, 200000000, 200000100, 500000000, 2600000000];

test('checkout, payment pages and cockpit give the same full probate fee for every estate value', async () => {
  const cockpit = await import(path.join(__dirname, 'fixtures/feeTiers.cockpit.mjs'));
  const front = await import(path.join(__dirname, '../../../src/services/feeMath.mjs'));
  for (const v of VALUES) {
    const a = pricing.fullProbateFeeCents(v).cents;
    const b = cockpit.fullProbateFee(v).cents;
    const c = Math.round(front.fullProbateFee(v / 100).fee * 100);
    assert.strictEqual(a, b, `checkout vs cockpit at ${v}`);
    assert.strictEqual(a, c, `checkout vs payment page at ${v}`);
    assert.strictEqual(pricing.statutoryFeeCents(v), cockpit.statutoryFeeCents(v), `10810 at ${v}`);
  }
});

test('accounting tier at 49 and 50 transactions: checkout money view and cockpit agree', async () => {
  const cockpit = await import(path.join(__dirname, 'fixtures/feeTiers.cockpit.mjs'));
  for (const [count, purchased] of [[49, 'simple'], [50, 'simple'], [49, 'complex'], [50, 'complex']]) {
    const mine = computeCaseTrust({ serviceType: 'simplified', addOns: { accounting: purchased }, ledgerTransactionCount: count, feeStages: {} }, [], [], []).accountingAdjustment;
    const theirs = cockpit.accountingTierChange({ purchased, count });
    assert.strictEqual(mine.shouldTier, theirs.should, `tier at ${count}`);
    assert.strictEqual(mine.kind === 'none' ? 0 : (mine.kind === 'refund' ? -mine.amountCents : mine.amountCents), theirs.deltaCents, `delta at ${count} from ${purchased}`);
  }
});
