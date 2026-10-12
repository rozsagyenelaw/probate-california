// The CommonJS copies used by the payment functions match their ESM originals (scripts/sync-shared-cjs.mjs).
// node --test netlify/functions/test/shared-cjs-parity.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..', '..');

test('CommonJS copies are current', async () => {
  const { PAIRS, toCjs } = await import(path.join(root, 'scripts/sync-shared-cjs.mjs'));
  for (const [from, to] of PAIRS) {
    assert.equal(fs.readFileSync(path.join(root, to), 'utf8'), toCjs(fs.readFileSync(path.join(root, from), 'utf8'), from), `${to} is out of date: run node scripts/sync-shared-cjs.mjs`);
  }
});

test('the server and the browser give the same answers', async () => {
  const esm = await import(path.join(root, 'src/lib/courtDays.js'));
  const cjs = require('../lib/courtDays.js');
  const now = new Date('2026-11-24T20:00:00Z');
  for (const d of ['2026-11-25', '2026-11-27', '2026-11-30', '2026-12-01']) assert.deepEqual(cjs.checkHearingDate(d, now), esm.checkHearingDate(d, now));
});
