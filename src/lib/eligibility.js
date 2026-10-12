// Estate route eligibility for intake (W2-legal, item 19).
// Pure module: no React, no Firebase, no browser APIs. Safe to import from the
// main site, the portal (W3-home intake move) and Cloud Functions.
//
// Sources, all opened 2026-10-10 (texts saved in
// ~/MyProbateCA_Investigation_2026-10-10/build-evidence/W2-legal/sources/):
//   Prob. Code 13050 (property excluded from the small estate value)
//     https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=13050
//   Prob. Code 13100 (affidavit; real AND personal property; 40 days)
//     https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=13100
//   Prob. Code 13151, 13152(f), 13154 (primary residence petition; 40 days; no personal property cap)
//     https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=13151
//     https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=13152
//   Prob. Code 13200 (real property of small value affidavit; six months)
//     https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=13200
//   Prob. Code 890(d) (adjustments do not apply when death preceded the adjustment date)
//     https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=890
//   Prob. Code 13500, 13650 (property passing to a surviving spouse)
//   Judicial Council, "Maximum Amounts for Determining Eligibility for Summary Succession Procedures"
//     https://courts.ca.gov/system/files/file/probate-code-890-adjusted-amounts.pdf
//
// The result is a recommendation for routing only. The attorney confirms every route.

export const SOURCES = Object.freeze({
  exclusions: 'Prob. Code 13050',
  affidavit: 'Prob. Code 13100',
  residencePetition: 'Prob. Code 13151, 13152(f), 13154',
  smallRealProperty: 'Prob. Code 13200',
  adjustments: 'Prob. Code 890; Judicial Council adjusted amounts list (next adjustment April 1, 2028)',
  spousal: 'Prob. Code 13500, 13650',
  table: 'https://courts.ca.gov/system/files/file/probate-code-890-adjusted-amounts.pdf'
});

// Judicial Council table, by date of death. `from` is inclusive, `to` is exclusive.
// 13100/13101 base of $166,250 took effect January 1, 2020 (Stats. 2019 ch. 122, AB 473);
// deaths before 2020 used older figures that are not on the current table, so they go to attorney review.
export const THRESHOLD_TABLE = Object.freeze([
  Object.freeze({ from: '2020-01-01', to: '2022-04-01', affidavit13100: 166250, residence13151: 166250, smallReal13200: 55425, label: 'before April 1, 2022' }),
  Object.freeze({ from: '2022-04-01', to: '2025-04-01', affidavit13100: 184500, residence13151: 184500, smallReal13200: 61500, label: 'April 1, 2022 to March 31, 2025' }),
  Object.freeze({ from: '2025-04-01', to: '2028-04-01', affidavit13100: 208850, residence13151: 750000, smallReal13200: 69625, label: 'on or after April 1, 2025' })
]);

export const WAIT_DAYS_AFFIDAVIT = 40;   // 13100
export const WAIT_DAYS_RESIDENCE = 40;   // 13151(a)
export const WAIT_MONTHS_SMALL_REAL = 6; // 13200(a)

export const ROUTES = Object.freeze({
  NEEDS_DATE_OF_DEATH: 'needs-date-of-death',
  NEEDS_HOME_VALUE: 'needs-home-value', // a main home is listed with no value: incomplete (Rozsa, 2026-10-12)
  ATTORNEY_REVIEW: 'attorney-review',
  NOTHING_TO_PROBATE: 'nothing-to-probate',
  SMALL_ESTATE_AFFIDAVIT: 'small-estate-affidavit',
  RESIDENCE_PETITION: 'residence-petition',
  RESIDENCE_PETITION_PLUS_PROBATE: 'residence-petition-plus-probate',
  FULL_PROBATE: 'full-probate'
});

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseYMD(value) {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  const s = String(value).trim().slice(0, 10);
  const m = YMD.exec(s);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return s;
}

export function addDays(ymd, days) {
  const [y, m, d] = ymd.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

export function addMonths(ymd, months) {
  const [y, m, d] = ymd.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(d, lastDay));
  return first.toISOString().slice(0, 10);
}

// Thresholds that apply to a date of death (YYYY-MM-DD). null when the date is outside the published table.
export function thresholdsForDeath(dateOfDeath) {
  const dod = parseYMD(dateOfDeath);
  if (!dod) return null;
  return THRESHOLD_TABLE.find(row => dod >= row.from && dod < row.to) || null;
}

const num = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const norm = (s) => String(s || '').trim().toLowerCase();

// 13050(a)(1): joint tenancy, revocable trust property, property passing to the spouse under 13500.
// "Community property with right of survivorship" passes to the surviving spouse by survivorship.
export function realPropertyExclusion(prop) {
  const t = norm(prop?.titleHolding);
  if (t.includes('joint tenan')) return 'joint-tenancy';
  if (t.includes('trust')) return 'trust';
  if (t.includes('survivorship')) return 'survivorship';
  return null;
}

// 13050(a)(1) trust; 13050(a)(2) multiple-party account to the extent it belongs to a surviving party or P.O.D. payee.
export function accountExclusion(acct) {
  const t = norm(acct?.ownershipType || acct?.ownership || acct?.titleHolding);
  if (!t) return null;
  if (t.includes('trust')) return 'trust';
  if (t.includes('pod') || t.includes('tod') || t.includes('payable') || t.includes('transfer on death') || t.includes('beneficiary')) return 'pod-tod';
  if (t.includes('joint')) return 'joint-account';
  return null;
}

const isPrimaryResidence = (p) => p?.propertyType === 'primary_residence' || p?.isPrimaryResidence === true;

// Summarise the intake assets (accepts every asset shape the intake has used).
export function summarizeAssets(assets = {}) {
  const excluded = [];
  const counted = [];
  let residence = null;
  let otherRealTotal = 0;
  let otherRealCount = 0;
  let personalTotal = 0;

  let residenceValueMissing = false;
  (assets.realProperty || []).forEach((p, i) => {
    const value = num(p.estimatedValue ?? p.value);
    const blank = num(p.estimatedValue ?? p.value) === 0;
    const why = realPropertyExclusion(p);
    const label = p.address || `Real property ${i + 1}`;
    if (why) { excluded.push({ kind: 'real', label, value, reason: why }); return; }
    if (isPrimaryResidence(p) && !residence) {
      residence = { label, value };
      residenceValueMissing = blank;
      counted.push({ kind: 'residence', label, value });
    } else {
      otherRealTotal += value;
      otherRealCount += 1;
      counted.push({ kind: 'real', label, value });
    }
  });

  const accountLists = [
    ...(assets.financialAccounts || []).map(a => ({ a, value: num(a.estimatedValue ?? a.balance ?? a.value) })),
    ...(assets.bankAccounts || []).map(a => ({ a, value: num(a.balance ?? a.estimatedValue ?? a.value) })),
    ...(assets.investments || []).map(a => ({ a, value: num(a.value ?? a.estimatedValue ?? a.balance) }))
  ];
  accountLists.forEach(({ a, value }, i) => {
    const why = accountExclusion(a);
    const label = a.institutionName || a.accountType || `Account ${i + 1}`;
    if (why) { excluded.push({ kind: 'account', label, value, reason: why }); return; }
    personalTotal += value;
    counted.push({ kind: 'account', label, value });
  });

  // 13050(b)(1): every registered vehicle is excluded, whatever its value.
  (assets.vehicles || []).forEach((v, i) => {
    excluded.push({ kind: 'vehicle', label: [v.year, v.make, v.model].filter(Boolean).join(' ') || `Vehicle ${i + 1}`, value: num(v.estimatedValue ?? v.value), reason: 'vehicle' });
  });

  [...(assets.personalProperty || []), ...(assets.otherAssets || [])].forEach((p, i) => {
    const why = accountExclusion(p);
    const value = num(p.estimatedValue ?? p.value);
    const label = p.description || p.name || `Item ${i + 1}`;
    if (why) { excluded.push({ kind: 'personal', label, value, reason: why }); return; }
    personalTotal += value;
    counted.push({ kind: 'personal', label, value });
  });

  const residenceValue = residence ? residence.value : 0;
  return {
    residence,
    residenceValue,
    residenceValueMissing,
    otherRealTotal,
    otherRealCount,
    personalTotal,
    countedTotal: residenceValue + otherRealTotal + personalTotal,
    excluded,
    counted
  };
}

/**
 * Recommend a route for the estate.
 * @param {object} input  intake formData ({ decedent: { dateOfDeath }, assets, survivedBySpouse })
 * @param {object} [opts] { today: 'YYYY-MM-DD' } (defaults to the current date)
 * @returns {{ route, simplifiedFits, dateOfDeath, thresholds, totals, earliestFiling, flags, reasons }}
 *   simplifiedFits: true only when the $2,495 home petition (13151) fits.
 *   reasons: machine-readable codes; the UI turns them into words.
 */
export function assessEligibility(input = {}, opts = {}) {
  const today = parseYMD(opts.today) || parseYMD(new Date());
  const dateOfDeath = parseYMD(input?.decedent?.dateOfDeath ?? input?.dateOfDeath);
  const totals = summarizeAssets(input?.assets || {});
  const flags = [];
  if (input?.survivedBySpouse === true || norm(input?.decedent?.maritalStatus) === 'married') flags.push('spouse-may-take-without-probate');
  if (totals.excluded.length) flags.push('some-assets-pass-outside-probate');

  const base = { dateOfDeath, totals, flags, thresholds: null, earliestFiling: null, reasons: [], simplifiedFits: false };

  if (!dateOfDeath) return { ...base, route: ROUTES.NEEDS_DATE_OF_DEATH, reasons: ['missing-date-of-death'] };
  if (today && dateOfDeath > today) return { ...base, route: ROUTES.NEEDS_DATE_OF_DEATH, reasons: ['date-of-death-in-future'] };

  const thresholds = thresholdsForDeath(dateOfDeath);
  if (!thresholds) {
    return { ...base, route: ROUTES.ATTORNEY_REVIEW, reasons: [dateOfDeath < THRESHOLD_TABLE[0].from ? 'death-before-2020' : 'death-after-published-table'] };
  }

  const earliestFiling = {
    affidavit13100: addDays(dateOfDeath, WAIT_DAYS_AFFIDAVIT),
    residence13151: addDays(dateOfDeath, WAIT_DAYS_RESIDENCE),
    smallReal13200: addMonths(dateOfDeath, WAIT_MONTHS_SMALL_REAL)
  };
  const out = { ...base, thresholds, earliestFiling };
  const { residence, residenceValue, otherRealTotal, otherRealCount, personalTotal, countedTotal } = totals;

  if (countedTotal === 0 && !residence && otherRealCount === 0) {
    return { ...out, route: totals.excluded.length ? ROUTES.NOTHING_TO_PROBATE : ROUTES.ATTORNEY_REVIEW, reasons: [totals.excluded.length ? 'all-assets-excluded' : 'no-assets-entered'] };
  }

  // A blank home value is not $0: the simpler process cannot be offered until the value is known.
  if (totals.residenceValueMissing) {
    return { ...out, route: ROUTES.NEEDS_HOME_VALUE, reasons: ['residence-value-missing'] };
  }

  const reasons = [];
  const residenceFits = !!residence && residenceValue <= thresholds.residence13151;
  if (residence) reasons.push(residenceFits ? 'residence-within-limit' : 'residence-over-limit');

  // 13100 counts real and personal property, excluding 13050 property and property in a 13151 petition.
  const affidavitWholeEstate = countedTotal <= thresholds.affidavit13100;
  const restAfterResidence = otherRealTotal + personalTotal;
  const affidavitForRest = restAfterResidence <= thresholds.affidavit13100;

  if (affidavitWholeEstate && !residence && otherRealCount === 0) {
    reasons.push('estate-within-affidavit-limit');
    return { ...out, route: ROUTES.SMALL_ESTATE_AFFIDAVIT, reasons };
  }

  if (residenceFits) {
    if (otherRealCount > 0) reasons.push('other-real-property');
    reasons.push(affidavitForRest ? 'rest-within-affidavit-limit' : 'rest-over-affidavit-limit');
    if (affidavitForRest) {
      return { ...out, route: ROUTES.RESIDENCE_PETITION, simplifiedFits: true, reasons };
    }
    return { ...out, route: ROUTES.RESIDENCE_PETITION_PLUS_PROBATE, reasons };
  }

  if (affidavitWholeEstate) {
    // Real property inside the 13100 limit still needs its own transfer step (13151 or 13200); attorney decides.
    reasons.push('estate-within-affidavit-limit', 'real-property-needs-own-step');
    if (otherRealTotal > 0 && otherRealTotal <= thresholds.smallReal13200) reasons.push('real-property-within-13200-limit');
    return { ...out, route: ROUTES.SMALL_ESTATE_AFFIDAVIT, reasons };
  }

  if (!residence) reasons.push('no-primary-residence');
  reasons.push('estate-over-affidavit-limit');
  return { ...out, route: ROUTES.FULL_PROBATE, reasons };
}

export default assessEligibility;
