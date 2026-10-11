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
