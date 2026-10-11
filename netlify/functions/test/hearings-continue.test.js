// W6-journey: continuing a hearing that has no purchased appearance must not write undefined to Firestore
// (the admin "Continued" save failed with 400 "Cannot use undefined as a Firestore value ... hearings.2.appearance").
const test = require('node:test');
const assert = require('node:assert');
const { continueHearing } = require('../lib/hearings');

const hasUndefined = (o) => o && typeof o === 'object' && Object.values(o).some(v => v === undefined || hasUndefined(v));

test('continue a hearing without an appearance: no undefined values', () => {
  const { hearings, newId } = continueHearing([{ id: 'h1', type: 'petition', date: '2026-11-30', time: '08:30', department: '11', source: 'admin', appearanceRequested: false }], 'h1', { date: '2027-01-11', time: '08:30' }, 'now');
  assert.strictEqual(hearings.length, 2);
  const moved = hearings.find(h => h.id === newId);
  assert.strictEqual(moved.date, '2027-01-11');
  assert.strictEqual(moved.appearance, null);
  assert.strictEqual(hearings[0].outcome, 'continued');
  assert.ok(!hearings.some(hasUndefined));
});

test('continue a hearing with a paid appearance: it carries over at no new charge', () => {
  const { hearings, newId } = continueHearing([{ id: 'h1', date: '2026-11-30', appearance: { paid: true, paymentId: 'p1' } }], 'h1', { date: '2027-01-11' }, 'now');
  const moved = hearings.find(h => h.id === newId);
  assert.deepStrictEqual(moved.appearance, { paid: true, paymentId: 'p1', carriedFromHearingId: 'h1', newChargeCents: 0 });
});

// Item i (W6 F38): the office entry and the checkout entry for the same date both move; the paid appearance goes
// to the new date, and nothing is left on the old date for the client to see.
test('continue the office entry when a checkout entry with the paid appearance has the same date', () => {
  const list = [
    { id: 'office1', type: 'petition', date: '2026-11-30', time: '08:30', department: '11', source: 'admin', appearanceRequested: false },
    { id: 'chk_1', type: 'other', date: '2026-11-30', time: '08:30', source: 'checkout', appearanceRequested: true, appearance: { kind: 'remote', paid: true, paymentId: 'cs_1' } }
  ];
  const { hearings, newId } = continueHearing(list, 'office1', { date: '2027-01-11', time: '08:30' }, 'now');
  const moved = hearings.find(h => h.id === newId);
  assert.strictEqual(moved.date, '2027-01-11');
  assert.strictEqual(moved.appearance.paid, true);
  assert.strictEqual(moved.appearance.carriedFromHearingId, 'chk_1');
  assert.strictEqual(moved.appearance.newChargeCents, 0);
  assert.strictEqual(moved.appearanceRequested, true);
  assert.ok(hearings.filter(h => h.date === '2026-11-30').every(h => h.outcome === 'continued'), 'nothing live stays on the old date');
  assert.ok(!hearings.some(hasUndefined));
});

test('a different hearing on another date is not touched', () => {
  const list = [{ id: 'a', date: '2026-11-30' }, { id: 'b', date: '2026-12-15', appearance: { paid: true } }];
  const { hearings } = continueHearing(list, 'a', { date: '2027-01-11' }, 'now');
  assert.strictEqual(hearings.find(h => h.id === 'b').outcome, undefined);
});

const { attachAppearance } = require('../lib/hearings');
test('appearance bought for a hearing picked in the client home goes on that entry (no second entry)', () => {
  const list = [{ id: 'office1', date: '2026-11-30', appearanceRequested: false }];
  const out = attachAppearance(list, 'office1', { kind: 'remote', paid: true, paymentId: 'cs_2' });
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].appearance.paid, true);
  assert.strictEqual(out[0].appearanceRequested, true);
  assert.strictEqual(attachAppearance(list, 'nope', { paid: true }), null);
  assert.strictEqual(attachAppearance([{ id: 'x', date: '2026-11-30', outcome: 'continued' }], 'x', { paid: true }), null);
});
