// Item i: Probate Code 10810 math for the city pages and the Learn article (4% of the first $100,000, 3% of the next
// $100,000, 2% of the next $800,000, 1% of the next $9,000,000) and the full probate tier for each estate.
// node --test netlify/functions/test/city-fees.test.js
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const src = path.join(__dirname, '..', '..', '..', 'src');

test('10810 amounts', async () => {
  const { statutoryFeeDollars } = await import(path.join(src, 'services', 'feeMath.mjs'));
  const { statutoryFeeCents } = require('../lib/pricing');
  for (const [value, fee] of [[1250000, 25500], [1100000, 24000], [1000000, 23000], [500000, 13000], [100000, 4000], [200000, 7000], [2000000, 33000], [3650000, 49500], [550000, 14000]]) {
    assert.strictEqual(statutoryFeeDollars(value), fee, `$${value}`);
    assert.strictEqual(statutoryFeeCents(value * 100), fee * 100, `server $${value}`);
  }
});

test('city example: tier price, difference and percent follow from the numbers', async () => {
  const { cityFeeExample } = await import(path.join(src, 'services', 'cityFees.mjs'));
  assert.deepStrictEqual(cityFeeExample(1250000), { estateValue: 1250000, statutoryFee: 25500, ourFee: 5995, difference: 19505, percentLess: 76, tierLabel: '$1,000,000 to $2,000,000' });
  assert.deepStrictEqual(cityFeeExample(1000000), { estateValue: 1000000, statutoryFee: 23000, ourFee: 3995, difference: 19005, percentLess: 82, tierLabel: 'up to $1,000,000' });
  assert.strictEqual(cityFeeExample(2650000).ourFee, 7995);
  assert.strictEqual(cityFeeExample(2650000).statutoryFee, 39500);
  assert.strictEqual(cityFeeExample(50000).ourFee, 2000, 'small estate: the lower 10810 amount');
  assert.strictEqual(cityFeeExample(50000).difference, 0);
});

test('every city page uses the computed figures (no fixed $23,000, $19,005 or 83%)', () => {
  const fs = require('fs');
  const page = fs.readFileSync(path.join(src, 'components', 'pages', 'CityProbatePage.jsx'), 'utf8');
  for (const bad of ['$19,005+', '83% less', '>$23,000<', 'Simplified Probate: $2,495', '$3,995 covers everything', 'Flat $3,995']) assert.ok(!page.includes(bad), bad);
  assert.ok(!/[–—]/.test(page), 'no em or en dashes');
});
