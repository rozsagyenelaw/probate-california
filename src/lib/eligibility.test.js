// Unit tests for src/lib/eligibility.js. Run: node --test src/lib/
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessEligibility, thresholdsForDeath, summarizeAssets, realPropertyExclusion, accountExclusion,
  parseYMD, addDays, addMonths, ROUTES, THRESHOLD_TABLE
} from './eligibility.js';

const TODAY = '2026-10-10';
const home = (value, extra = {}) => ({ address: '1 Main St', propertyType: 'primary_residence', isPrimaryResidence: true, estimatedValue: String(value), titleHolding: 'Decedent alone', ...extra });
const lot = (value, extra = {}) => ({ address: 'Lot 9', propertyType: 'land', estimatedValue: String(value), titleHolding: 'Decedent alone', ...extra });
const acct = (value, ownershipType = 'Sole owner') => ({ institutionName: 'Bank', accountType: 'Checking Account', estimatedValue: String(value), ownershipType });
const car = (value) => ({ year: '2020', make: 'Toyota', model: 'Camry', estimatedValue: String(value) });
const run = (dateOfDeath, assets, extra = {}) => assessEligibility({ decedent: { dateOfDeath }, assets, ...extra }, { today: TODAY });

// ---------- dates and thresholds (Judicial Council table; 890(d)) ----------
test('thresholds: deaths on or after April 1, 2025 use $208,850 / $750,000 / $69,625', () => {
  const t = thresholdsForDeath('2025-04-01');
  assert.equal(t.affidavit13100, 208850);
  assert.equal(t.residence13151, 750000);
  assert.equal(t.smallReal13200, 69625);
});
test('thresholds: March 31, 2025 death uses the 2022 figures ($184,500)', () => {
  const t = thresholdsForDeath('2025-03-31');
  assert.equal(t.affidavit13100, 184500);
  assert.equal(t.residence13151, 184500);
  assert.equal(t.smallReal13200, 61500);
});
test('thresholds: April 1, 2022 boundary', () => {
  assert.equal(thresholdsForDeath('2022-04-01').affidavit13100, 184500);
  assert.equal(thresholdsForDeath('2022-03-31').affidavit13100, 166250);
  assert.equal(thresholdsForDeath('2022-03-31').smallReal13200, 55425);
});
test('thresholds: outside the published table returns null', () => {
  assert.equal(thresholdsForDeath('2019-12-31'), null);
  assert.equal(thresholdsForDeath('2028-04-01'), null);
  assert.equal(thresholdsForDeath('not a date'), null);
  assert.equal(thresholdsForDeath(''), null);
});
test('table rows are contiguous', () => {
  for (let i = 1; i < THRESHOLD_TABLE.length; i++) assert.equal(THRESHOLD_TABLE[i].from, THRESHOLD_TABLE[i - 1].to);
});
test('date helpers', () => {
  assert.equal(parseYMD('2025-02-30'), null);
  assert.equal(parseYMD('2025-04-01T00:00:00Z'), '2025-04-01');
  assert.equal(parseYMD(new Date(2025, 3, 1)), '2025-04-01');
  assert.equal(addDays('2025-12-31', 40), '2026-02-09');
  assert.equal(addMonths('2025-08-31', 6), '2026-02-28');
});

// ---------- 13050 exclusions ----------
test('exclusions: joint tenancy, trust and survivorship real property', () => {
  assert.equal(realPropertyExclusion({ titleHolding: 'Joint tenancy' }), 'joint-tenancy');
  assert.equal(realPropertyExclusion({ titleHolding: 'Held in trust' }), 'trust');
  assert.equal(realPropertyExclusion({ titleHolding: 'Community property with survivorship' }), 'survivorship');
  assert.equal(realPropertyExclusion({ titleHolding: 'Community property' }), null);
  assert.equal(realPropertyExclusion({ titleHolding: 'Tenants in common' }), null);
  assert.equal(realPropertyExclusion({ titleHolding: 'Decedent alone' }), null);
});
test('exclusions: joint, POD/TOD and trust accounts', () => {
  assert.equal(accountExclusion({ ownershipType: 'Joint account' }), 'joint-account');
  assert.equal(accountExclusion({ ownershipType: 'POD/TOD beneficiary' }), 'pod-tod');
  assert.equal(accountExclusion({ ownershipType: 'Trust' }), 'trust');
  assert.equal(accountExclusion({ ownershipType: 'Sole owner' }), null);
  assert.equal(accountExclusion({}), null);
});
test('exclusions: every vehicle is excluded whatever its value (13050(b)(1))', () => {
  const s = summarizeAssets({ vehicles: [car(90000), car(500000)] });
  assert.equal(s.personalTotal, 0);
  assert.equal(s.excluded.filter(e => e.reason === 'vehicle').length, 2);
});
test('summary reads every asset shape the intake has used', () => {
  const s = summarizeAssets({
    financialAccounts: [acct(1000)],
    bankAccounts: [{ balance: '2,000' }],
    investments: [{ value: 3000 }],
    personalProperty: [{ description: 'Jewelry', estimatedValue: '400' }],
    otherAssets: [{ name: 'Note', value: '600' }]
  });
  assert.equal(s.personalTotal, 7000);
});
test('bad or negative numbers count as zero', () => {
  const s = summarizeAssets({ financialAccounts: [acct('abc'), acct(-50), acct('')] });
  assert.equal(s.personalTotal, 0);
});

// ---------- routes ----------
test('route: missing date of death asks for it', () => {
  const r = run('', { financialAccounts: [acct(1000)] });
  assert.equal(r.route, ROUTES.NEEDS_DATE_OF_DEATH);
  assert.equal(r.simplifiedFits, false);
});
test('route: date of death in the future asks for it again', () => {
  assert.equal(run('2027-01-01', {}).route, ROUTES.NEEDS_DATE_OF_DEATH);
});
test('route: death before 2020 goes to attorney review', () => {
  assert.equal(run('2018-06-01', { financialAccounts: [acct(1000)] }).route, ROUTES.ATTORNEY_REVIEW);
});
test('route: nothing entered goes to attorney review', () => {
  assert.equal(run('2025-06-01', {}).route, ROUTES.ATTORNEY_REVIEW);
});
test('route: everything passes outside probate', () => {
  const r = run('2025-06-01', { realProperty: [home(900000, { titleHolding: 'Joint tenancy' })], financialAccounts: [acct(50000, 'POD/TOD beneficiary')], vehicles: [car(30000)] });
  assert.equal(r.route, ROUTES.NOTHING_TO_PROBATE);
  assert.ok(r.flags.includes('some-assets-pass-outside-probate'));
});
test('route: $200,000 of accounts, death 2025-06-01 => small estate affidavit (limit $208,850)', () => {
  const r = run('2025-06-01', { financialAccounts: [acct(200000)] });
  assert.equal(r.route, ROUTES.SMALL_ESTATE_AFFIDAVIT);
  assert.equal(r.simplifiedFits, false);
  assert.equal(r.earliestFiling.affidavit13100, '2025-07-11');
});
test('route: same $200,000, death 2024-06-01 => full probate (limit then $184,500)', () => {
  const r = run('2024-06-01', { financialAccounts: [acct(200000)] });
  assert.equal(r.route, ROUTES.FULL_PROBATE);
  assert.ok(r.reasons.includes('estate-over-affidavit-limit'));
});
test('route: exactly at the limit qualifies ("does not exceed")', () => {
  assert.equal(run('2025-06-01', { financialAccounts: [acct(208850)] }).route, ROUTES.SMALL_ESTATE_AFFIDAVIT);
  assert.equal(run('2025-06-01', { financialAccounts: [acct(208851)] }).route, ROUTES.FULL_PROBATE);
});
test('route: vehicles and POD accounts do not push an estate over the affidavit limit', () => {
  const r = run('2025-06-01', { financialAccounts: [acct(150000), acct(400000, 'POD/TOD beneficiary'), acct(90000, 'Joint account')], vehicles: [car(120000)] });
  assert.equal(r.route, ROUTES.SMALL_ESTATE_AFFIDAVIT);
  assert.equal(r.totals.personalTotal, 150000);
});
test('route: home $700,000 + $500,000 of accounts, death 2025-06-01 => home petition plus probate for the rest (no personal property cap on 13151)', () => {
  const r = run('2025-06-01', { realProperty: [home(700000)], financialAccounts: [acct(500000)] });
  assert.equal(r.route, ROUTES.RESIDENCE_PETITION_PLUS_PROBATE);
  assert.ok(r.reasons.includes('residence-within-limit'));
  assert.ok(r.reasons.includes('rest-over-affidavit-limit'));
});
test('route: home $700,000 + $150,000 of accounts, death 2025-06-01 => simplified home petition', () => {
  const r = run('2025-06-01', { realProperty: [home(700000)], financialAccounts: [acct(150000)] });
  assert.equal(r.route, ROUTES.RESIDENCE_PETITION);
  assert.equal(r.simplifiedFits, true);
  assert.equal(r.earliestFiling.residence13151, '2025-07-11');
});
test('route: home exactly $750,000 fits; $750,001 does not', () => {
  assert.equal(run('2025-04-01', { realProperty: [home(750000)] }).route, ROUTES.RESIDENCE_PETITION);
  assert.equal(run('2025-04-01', { realProperty: [home(750001)] }).route, ROUTES.FULL_PROBATE);
});
test('route: home $500,000, death 2025-03-31 => full probate (13152(f)(2) limit $184,500)', () => {
  const r = run('2025-03-31', { realProperty: [home(500000)] });
  assert.equal(r.route, ROUTES.FULL_PROBATE);
  assert.ok(r.reasons.includes('residence-over-limit'));
});
test('route: home $180,000, death 2023-01-15 => simplified home petition under the 2022 limit', () => {
  assert.equal(run('2023-01-15', { realProperty: [home(180000)] }).route, ROUTES.RESIDENCE_PETITION);
});
test('route: home $160,000, death 2021-05-01 => simplified under the $166,250 limit', () => {
  assert.equal(run('2021-05-01', { realProperty: [home(160000)] }).route, ROUTES.RESIDENCE_PETITION);
  assert.equal(run('2021-05-01', { realProperty: [home(170000)] }).route, ROUTES.FULL_PROBATE);
});
test('route: home in joint tenancy is excluded; small accounts => affidavit', () => {
  const r = run('2025-06-01', { realProperty: [home(1200000, { titleHolding: 'Joint tenancy' })], financialAccounts: [acct(100000)] });
  assert.equal(r.route, ROUTES.SMALL_ESTATE_AFFIDAVIT);
});
test('route: home in a trust is excluded', () => {
  const r = run('2025-06-01', { realProperty: [home(1200000, { titleHolding: 'Held in trust' })], financialAccounts: [acct(300000)] });
  assert.equal(r.route, ROUTES.FULL_PROBATE);
  assert.equal(r.totals.residence, null);
});
test('route: home fits but there is a second property => petition plus affidavit when the rest is small', () => {
  const r = run('2025-06-01', { realProperty: [home(600000), lot(50000)], financialAccounts: [acct(20000)] });
  assert.equal(r.route, ROUTES.RESIDENCE_PETITION);
  assert.ok(r.reasons.includes('other-real-property'));
});
test('route: home fits but a large second property => petition plus probate', () => {
  const r = run('2025-06-01', { realProperty: [home(600000), lot(400000)] });
  assert.equal(r.route, ROUTES.RESIDENCE_PETITION_PLUS_PROBATE);
});
test('route: no home, small lot only, inside affidavit limit => affidavit route with own real property step', () => {
  const r = run('2025-06-01', { realProperty: [lot(60000)], financialAccounts: [acct(10000)] });
  assert.equal(r.route, ROUTES.SMALL_ESTATE_AFFIDAVIT);
  assert.ok(r.reasons.includes('real-property-needs-own-step'));
  assert.ok(r.reasons.includes('real-property-within-13200-limit'));
  assert.equal(r.earliestFiling.smallReal13200, '2025-12-01');
});
test('route: no home, lot over the affidavit limit => full probate', () => {
  const r = run('2025-06-01', { realProperty: [lot(300000)] });
  assert.equal(r.route, ROUTES.FULL_PROBATE);
  assert.ok(r.reasons.includes('no-primary-residence'));
});
test('route: death after the published table (April 1, 2028 or later) => attorney review', () => {
  const r = assessEligibility({ decedent: { dateOfDeath: '2028-05-01' }, assets: { financialAccounts: [acct(1000)] } }, { today: '2028-09-01' });
  assert.equal(r.route, ROUTES.ATTORNEY_REVIEW);
  assert.deepEqual(r.reasons, ['death-after-published-table']);
});
test('flag: surviving spouse', () => {
  const r = run('2025-06-01', { financialAccounts: [acct(500000)] }, { survivedBySpouse: true });
  assert.ok(r.flags.includes('spouse-may-take-without-probate'));
  const r2 = assessEligibility({ decedent: { dateOfDeath: '2025-06-01', maritalStatus: 'Married' }, assets: { financialAccounts: [acct(1)] } }, { today: TODAY });
  assert.ok(r2.flags.includes('spouse-may-take-without-probate'));
});
test('default today is used when none is passed', () => {
  const r = assessEligibility({ decedent: { dateOfDeath: '2025-06-01' }, assets: { financialAccounts: [acct(1000)] } });
  assert.equal(r.route, ROUTES.SMALL_ESTATE_AFFIDAVIT);
});

// Rozsa, 2026-10-12 (item m): a main home with no value entered is incomplete, never "fits"
test('a blank home value is incomplete, not $0', () => {
  const input = { decedent: { dateOfDeath: '2025-06-01' }, assets: { realProperty: [{ propertyType: 'primary_residence', estimatedValue: '' }] } };
  const r = assessEligibility(input, { today: '2026-10-12' });
  assert.equal(r.route, ROUTES.NEEDS_HOME_VALUE);
  assert.equal(r.simplifiedFits, false);
  assert.equal(r.totals.residenceValueMissing, true);
  const filled = assessEligibility({ ...input, assets: { realProperty: [{ propertyType: 'primary_residence', estimatedValue: '640000' }] } }, { today: '2026-10-12' });
  assert.equal(filled.route, ROUTES.RESIDENCE_PETITION);
  assert.equal(filled.simplifiedFits, true);
});
