// Court days and the court appearance booking window (Rozsa, decisions 2026-10-12 point 4).
// Pure module: no React, no Firebase. The same file is used by the client home (portal src/home/courtDays.js, an
// exact copy) and, as a CommonJS copy, by the payment functions (netlify/functions/lib/courtDays.js, made by
// scripts/sync-shared-cjs.mjs; a test checks the copy is current).
//
// Sources, opened 2026-10-12:
//   Code of Civil Procedure 135 (judicial holidays: every Gov. Code 6700 holiday except Lunar New Year, Diwali,
//     Genocide Remembrance Day, Admission Day and Columbus Day; plus Thanksgiving, the day after, and every Saturday;
//     the Judicial Council may designate another day when a holiday falls on a weekend)
//     https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CCP&sectionNum=135
//   Government Code 6700 (the list of state holidays)
//     https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=6700
//   Judicial Council, Court Holidays (the dates the courts are closed, 2026 and 2027)
//     https://courts.ca.gov/about/court-holidays
//
// Rules: the earliest hearing a client can book online is the second court day after today (Pacific time).
// A hearing fewer than 7 calendar days away is "short notice": the office confirms within 1 business day, or the
// $500 is refunded in full automatically.

export const PACIFIC = 'America/Los_Angeles';
export const MIN_COURT_DAYS = 2;
export const SHORT_NOTICE_DAYS = 7;

// The Judicial Council's published court holidays (the dates the courts are actually closed).
export const PUBLISHED_HOLIDAYS = Object.freeze({
  2026: ['2026-01-01', '2026-01-19', '2026-02-12', '2026-02-16', '2026-03-31', '2026-05-25', '2026-06-19', '2026-07-03', '2026-09-07', '2026-09-25', '2026-11-11', '2026-11-26', '2026-11-27', '2026-12-25'],
  2027: ['2027-01-01', '2027-01-18', '2027-02-12', '2027-02-15', '2027-04-09', '2027-05-31', '2027-06-18', '2027-07-05', '2027-09-06', '2027-09-24', '2027-11-11', '2027-11-25', '2027-11-26', '2027-12-24']
});

const pad = (n) => String(n).padStart(2, '0');
const ymdOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseYMD(s) {
  const m = YMD.exec(String(s || '').trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return m[0];
}

const dow = (ymd) => { const [y, m, d] = ymd.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };

export function addDays(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function daysBetween(fromYmd, toYmd) {
  const a = Date.UTC(...fromYmd.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v))));
  const b = Date.UTC(...toYmd.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v))));
  return Math.round((b - a) / 86400000);
}

// nth weekday (0 = Sunday) of a month; n = -1 for the last one
function nthWeekday(y, month, weekday, n) {
  if (n > 0) {
    const first = new Date(Date.UTC(y, month - 1, 1)).getUTCDay();
    return ymdOf(y, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
  }
  const lastDay = new Date(Date.UTC(y, month, 0)).getUTCDate();
  const last = new Date(Date.UTC(y, month - 1, lastDay)).getUTCDay();
  return ymdOf(y, month, lastDay - ((last - weekday + 7) % 7));
}

// A fixed-date holiday on a Saturday is observed the Friday before, on a Sunday the Monday after (the pattern the
// Judicial Council used for 2026 and 2027: July 4, 2026 on Friday July 3; Juneteenth 2027 on Friday June 18;
// July 4, 2027 on Monday July 5; Christmas 2027 on Friday December 24).
function observed(ymd) {
  const w = dow(ymd);
  if (w === 6) return addDays(ymd, -1);
  if (w === 0) return addDays(ymd, 1);
  return ymd;
}

// Years the Judicial Council has not published yet: CCP 135 and Gov. Code 6700 applied with the observance pattern above.
export function computedHolidays(y) {
  const fixed = [[1, 1], [2, 12], [3, 31], [6, 19], [7, 4], [11, 11], [12, 25]].map(([m, d]) => observed(ymdOf(y, m, d)));
  const thanksgiving = nthWeekday(y, 11, 4, 4);
  return [
    ...fixed,
    nthWeekday(y, 1, 1, 3), // Dr. Martin Luther King, Jr. Day
    nthWeekday(y, 2, 1, 3), // third Monday in February
    nthWeekday(y, 5, 1, -1), // last Monday in May
    nthWeekday(y, 9, 1, 1), // first Monday in September
    nthWeekday(y, 9, 5, 4), // Native American Day, fourth Friday in September
    thanksgiving,
    addDays(thanksgiving, 1)
  ].sort();
}

export function holidaysFor(year) {
  return PUBLISHED_HOLIDAYS[year] || computedHolidays(Number(year));
}

export function isCourtHoliday(ymd) {
  return holidaysFor(Number(ymd.slice(0, 4))).includes(ymd);
}

export function isCourtDay(ymd) {
  const w = dow(ymd);
  return w !== 0 && w !== 6 && !isCourtHoliday(ymd);
}

export function addCourtDays(ymd, n) {
  let d = ymd;
  let left = n;
  while (left > 0) { d = addDays(d, 1); if (isCourtDay(d)) left -= 1; }
  return d;
}

// Today's date in California (Pacific time), whatever the time zone of the device or server
export function pacificToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: PACIFIC, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function earliestBookable(now = new Date()) {
  return addCourtDays(pacificToday(now), MIN_COURT_DAYS);
}

// { ok, reason, earliest, daysAway, shortNotice }
// reason: 'bad-date' | 'past' | 'too-soon' | 'not-court-day' | null
export function checkHearingDate(date, now = new Date()) {
  const today = pacificToday(now);
  const earliest = addCourtDays(today, MIN_COURT_DAYS);
  const d = parseYMD(date);
  if (!d) return { ok: false, reason: 'bad-date', earliest, daysAway: null, shortNotice: false };
  const daysAway = daysBetween(today, d);
  if (daysAway < 0) return { ok: false, reason: 'past', earliest, daysAway, shortNotice: false };
  if (d < earliest) return { ok: false, reason: 'too-soon', earliest, daysAway, shortNotice: false };
  if (!isCourtDay(d)) return { ok: false, reason: 'not-court-day', earliest, daysAway, shortNotice: false };
  return { ok: true, reason: null, earliest, daysAway, shortNotice: daysAway < SHORT_NOTICE_DAYS };
}

export function formatLongDate(ymd) {
  const d = parseYMD(ymd);
  if (!d) return '';
  const [y, m, dd] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, dd, 12)).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// Plain words for a date the page will not book online
export function hearingDateMessage(check) {
  if (!check || check.ok) return '';
  const when = formatLongDate(check.earliest);
  if (check.reason === 'bad-date') return 'Please enter the hearing date from your court notice.';
  if (check.reason === 'past') return 'That date has passed. Please enter the date of your next hearing.';
  if (check.reason === 'not-court-day') return 'Courts are closed on that day. Please check the date on your court notice.';
  return `That hearing is too soon to book online. The earliest date we can take online is ${when}. Please send us a message right away with your hearing date, and we tell you what we can do. You can also attend the hearing yourself; you are the petitioner.`;
}
