// node --test src/lib/courtDays.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUBLISHED_HOLIDAYS, computedHolidays, isCourtDay, isCourtHoliday, addCourtDays, pacificToday,
  earliestBookable, checkHearingDate, hearingDateMessage
} from './courtDays.js';

const at = (iso) => new Date(iso);

test('weekends are not court days', () => {
  assert.equal(isCourtDay('2026-10-17'), false); // Saturday
  assert.equal(isCourtDay('2026-10-18'), false); // Sunday
  assert.equal(isCourtDay('2026-10-19'), true);
});

test('published 2026 and 2027 court holidays (Judicial Council) are closed days', () => {
  for (const y of [2026, 2027]) for (const d of PUBLISHED_HOLIDAYS[y]) assert.equal(isCourtDay(d), false, d);
  assert.equal(isCourtHoliday('2026-07-03'), true); // July 4, 2026 is a Saturday: observed Friday
  assert.equal(isCourtHoliday('2026-11-27'), true); // day after Thanksgiving
  assert.equal(isCourtHoliday('2027-04-09'), true); // Farmworkers Day as published for 2027
});

test('Columbus Day and Admission Day are not court holidays (CCP 135)', () => {
  assert.equal(isCourtDay('2026-10-12'), true); // second Monday in October 2026
  assert.equal(isCourtDay('2026-09-09'), true); // Admission Day, a Wednesday
});

test('computed holidays match the published 2026 list (rule check)', () => {
  assert.deepEqual(computedHolidays(2026), [...PUBLISHED_HOLIDAYS[2026]].sort());
});

test('computed holidays for an unpublished year follow CCP 135 and Gov. Code 6700', () => {
  const h = computedHolidays(2028);
  for (const d of ['2028-01-17', '2028-02-21', '2028-03-31', '2028-05-29', '2028-06-19', '2028-07-04', '2028-09-04', '2028-09-22', '2028-11-10', '2028-11-23', '2028-11-24', '2028-12-25']) assert.ok(h.includes(d), d);
  assert.ok(h.includes('2028-02-11')); // Lincoln Day Feb 12, 2028 is a Saturday: Friday Feb 11
  assert.ok(!h.includes('2028-10-09')); // Columbus Day
});

test('two court days skip weekends and holidays', () => {
  assert.equal(addCourtDays('2026-10-12', 2), '2026-10-14'); // Mon -> Wed
  assert.equal(addCourtDays('2026-10-15', 2), '2026-10-19'); // Thu -> Mon
  assert.equal(addCourtDays('2026-10-16', 2), '2026-10-20'); // Fri -> Tue
  assert.equal(addCourtDays('2026-11-24', 2), '2026-11-30'); // Tue -> Wed 25, (26, 27 holidays, 28, 29 weekend) -> Mon 30
  assert.equal(addCourtDays('2026-11-10', 2), '2026-11-13'); // Veterans Day Wed 11 skipped
  assert.equal(addCourtDays('2026-12-23', 2), '2026-12-28'); // Thu 24, (Fri 25 holiday, weekend) Mon 28
});

test('today is computed in Pacific time, not UTC', () => {
  // 11:30 pm Pacific on Monday Oct 12 2026 is already Tuesday in UTC
  assert.equal(pacificToday(at('2026-10-13T06:30:00Z')), '2026-10-12');
  assert.equal(earliestBookable(at('2026-10-13T06:30:00Z')), '2026-10-14');
  // 12:30 am Pacific on Tuesday
  assert.equal(pacificToday(at('2026-10-13T07:30:00Z')), '2026-10-13');
  assert.equal(earliestBookable(at('2026-10-13T07:30:00Z')), '2026-10-15');
  // winter (PST, UTC-8): 4:30 pm Pacific Friday Dec 4 2026 is Saturday 00:30 UTC
  assert.equal(pacificToday(at('2026-12-05T00:30:00Z')), '2026-12-04');
});

test('checkHearingDate: too soon, short notice, normal, weekend, past', () => {
  const now = at('2026-10-12T17:00:00Z'); // Monday 10 am Pacific
  assert.deepEqual(checkHearingDate('2026-10-13', now).reason, 'too-soon');
  const two = checkHearingDate('2026-10-14', now);
  assert.equal(two.ok, true); assert.equal(two.shortNotice, true); assert.equal(two.daysAway, 2);
  const five = checkHearingDate('2026-10-16', now);
  assert.equal(five.ok, true); assert.equal(five.shortNotice, true);
  const seven = checkHearingDate('2026-10-19', now);
  assert.equal(seven.ok, true); assert.equal(seven.shortNotice, false);
  assert.equal(checkHearingDate('2026-10-17', now).reason, 'not-court-day');
  assert.equal(checkHearingDate('2026-11-26', now).reason, 'not-court-day');
  assert.equal(checkHearingDate('2026-10-01', now).reason, 'past');
  assert.equal(checkHearingDate('10/16/2026', now).reason, 'bad-date');
});

test('messages are plain and have no dashes', () => {
  const now = at('2026-10-12T17:00:00Z');
  const msg = hearingDateMessage(checkHearingDate('2026-10-13', now));
  assert.match(msg, /Wednesday, October 14, 2026/);
  assert.doesNotMatch(msg, /[\u2013\u2014]/);
});
