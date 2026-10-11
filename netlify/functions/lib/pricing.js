// One place for what each service costs (cents) and how a 3-payment plan is split.
// Full probate fee for small estates (Rozsa, 2026-10-10): the LOWER of $3,995 and the Probate Code
// section 10810 amount on the estate value from intake, shown before checkout.
// Source opened 2026-10-10: https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=10810
//   (a) 4% of the first $100,000; 3% of the next $100,000; 2% of the next $800,000; 1% of the next $9,000,000;
//   one-half of 1% of the next $15,000,000; above $25,000,000 a reasonable amount set by the court.
//   (b) value = inventory appraisal plus gains and receipts less losses, without reference to encumbrances.

const BASE_CENTS = {
  simplified: 249500,
  full: 399500,
  simple_accounting: 99500,
  complex_accounting: 199500,
  remote_appearance: 50000
};

// House sale add-on (decisions section 30): per property. An extraordinary service (Cal. Rules of Court 7.703(c)(1)),
// so it is never counted inside the 10810 ordinary-services limit.
const HOUSE_SALE = {
  npa: { cents: 99500, label: 'House sale papers (Notice of Proposed Action)' },
  confirmation: { cents: 149500, label: 'House sale papers (court confirmation of sale)' }
};

const LABELS = {
  simplified: 'Simplified Probate',
  full: 'Full Probate',
  simple: 'Simple Accounting',
  complex: 'Complex Accounting',
  remote: 'Remote Court Appearance',
  contested: 'Contested Hearing (2-hour minimum)'
};

// Probate Code 10810(a) amount, in cents, for an estate value in cents (no rounding until the end).
function statutoryFeeCents(estateValueCents) {
  const v = Math.max(0, Math.floor(Number(estateValueCents) || 0));
  const bands = [[10000000, 0.04], [10000000, 0.03], [80000000, 0.02], [900000000, 0.01], [1500000000, 0.005]];
  let left = v; let fee = 0;
  for (const [size, rate] of bands) { const part = Math.min(left, size); fee += part * rate; left -= part; if (left <= 0) break; }
  if (left > 0) return Infinity; // above $25,000,000: set by the court, so the flat fee is always lower
  return Math.round(fee);
}

// Full probate price tiers (Rozsa, decisions section 28, approved 2026-10-11), by the gross probate estate value:
//   up to $1,000,000: $3,995 (and below that the small-estate rule: never more than the 10810 amount);
//   $1,000,000 to $2,000,000: $5,995;   over $2,000,000: $7,995.
const FULL_TIERS = [
  { key: 'up-to-1m', upToCents: 100000000, cents: 399500, label: 'Estates up to $1,000,000' },
  { key: '1m-to-2m', upToCents: 200000000, cents: 599500, label: 'Estates from $1,000,000 to $2,000,000' },
  { key: 'over-2m', upToCents: Infinity, cents: 799500, label: 'Estates over $2,000,000' }
];
function fullProbateTier(estateValueCents) {
  const v = Math.floor(Number(estateValueCents) || 0);
  return FULL_TIERS.find(t => v <= t.upToCents);
}
// Full probate fee for an estate value. Unknown value: { cents: null } (the value must be entered before checkout).
function fullProbateFeeCents(estateValueCents) {
  const v = Math.floor(Number(estateValueCents) || 0);
  if (!(v > 0)) return { cents: BASE_CENTS.full, basis: 'flat', tier: null, needsEstateValue: true };
  const tier = fullProbateTier(v);
  const statutory = statutoryFeeCents(v);
  if (statutory < tier.cents) return { cents: statutory, basis: '10810', tier: tier.key, estateValueCents: v };
  return { cents: tier.cents, basis: tier.key === 'up-to-1m' ? 'flat' : 'tier', tier: tier.key, estateValueCents: v };
}

// Gross estate value from intake answers (10810(b): without reference to encumbrances), in cents.
// Same sum as the intake payment step shows the client (PaymentStep estateAnalysis.totalEstateValue).
function estateValueFromIntake(formData) {
  const a = (formData && formData.assets) || {};
  const n = (x) => { const f = parseFloat(String(x == null ? '' : x).replace(/[$,\s]/g, '')); return Number.isFinite(f) && f > 0 ? f : 0; };
  let dollars = 0;
  (a.realProperty || []).forEach(p => { dollars += n(p.estimatedValue); });
  (a.bankAccounts || []).forEach(x => { dollars += n(x.balance); });
  (a.investments || []).forEach(x => { dollars += n(x.value); });
  (a.vehicles || []).forEach(x => { dollars += n(x.estimatedValue); });
  (a.otherAssets || []).forEach(x => { dollars += n(x.value); });
  return Math.round(dollars * 100);
}

function contestedCents(settings) {
  const c = (settings && settings.contestedHearing) || {};
  if (c.offered === false) return null;
  const dollars = Number(c.price);
  return Number.isFinite(dollars) && dollars > 0 ? Math.round(dollars * 100) : 60000;
}

function courtCents(kind, settings) {
  if (kind === 'remote') return BASE_CENTS.remote_appearance;
  if (kind === 'contested') return contestedCents(settings);
  return null;
}

// What is being bought in this checkout, with a cent amount per line.
// Throws a user-facing Error for anything invalid.
// Ordinary services under Probate Code 10810 for FULL probate (Rozsa's ruling, decisions section 21): the flat fee,
// the accounting add-on and any uncontested (remote) court appearance together never exceed the 10810 amount.
// A contested hearing is not an ordinary service and is not capped. Simplified (13151) is not capped at all.
const ORDINARY_KEYS = new Set(['full', 'fee_balance', 'simple_accounting', 'complex_accounting', 'remote_appearance']);

// What is being bought in this checkout, with a cent amount per line.
// capContext (full probate with a known estate value): { estateValueCents, priorOrdinaryCents } so purchases made
// later (add-ons) also stay within the cap. Lines brought to $0 by the cap are kept with included: true.
function buildOrder({ serviceType, accountingAddon, courtAppearance, estateValueCents, estateRange, capContext, balanceCents, balanceLabel, houseSale, houseSaleCount }, settings) {
  const lines = [];
  let fee = null;
  if (serviceType === 'fee_balance') {
    // Balance due after the inventory moved the estate to another tier (created only by the admin, confirmed by Rozsa)
    const c = Math.round(Number(balanceCents));
    if (!(c > 0)) throw new Error('No balance is due');
    lines.push({ key: 'fee_balance', label: balanceLabel || 'Full Probate fee adjustment (estate value from the inventory)', cents: c });
    const totalCents = c;
    return { lines, totalCents, ordinaryCents: c, capCents: null, description: lines[0].label, feeBasis: 'adjustment', estateValueCents: null };
  }
  if (serviceType === 'full') {
    // The questionnaire's estate value sets the fee (tier and small-estate rule). Before it is known, the range the
    // client picked at account creation (decisions section 32) sets the tier fee.
    const range = FULL_TIERS.find(t => t.key === estateRange);
    fee = Number(estateValueCents) > 0 ? fullProbateFeeCents(estateValueCents) : (range ? { cents: range.cents, basis: 'tier-range', tier: range.key } : fullProbateFeeCents(estateValueCents));
    lines.push({ key: 'full', label: LABELS.full, cents: fee.cents, basis: fee.basis });
  } else if (serviceType === 'simplified') {
    lines.push({ key: serviceType, label: LABELS[serviceType], cents: BASE_CENTS[serviceType] });
  } else if (!['accounting_only', 'accounting_addon', 'court_appearance', 'house_sale'].includes(serviceType)) {
    throw new Error('Invalid service type selected');
  }
  if (accountingAddon) {
    if (!['simple', 'complex'].includes(accountingAddon)) throw new Error('Invalid accounting service selected');
    lines.push({ key: `${accountingAddon}_accounting`, label: LABELS[accountingAddon], cents: BASE_CENTS[`${accountingAddon}_accounting`] });
  }
  if (courtAppearance) {
    if (!['remote', 'contested'].includes(courtAppearance)) throw new Error('Invalid court appearance selected');
    const cents = courtCents(courtAppearance, settings);
    if (cents == null) throw new Error('Contested hearings are not offered online.');
    lines.push({ key: courtAppearance === 'remote' ? 'remote_appearance' : 'contested_hearing', label: LABELS[courtAppearance], cents });
  }
  if (houseSale) {
    if (!HOUSE_SALE[houseSale]) throw new Error('Invalid house sale service selected');
    const n = Math.max(1, Math.min(10, Math.floor(Number(houseSaleCount) || 1)));
    lines.push({ key: `house_sale_${houseSale}`, label: HOUSE_SALE[houseSale].label + (n > 1 ? ` (${n} properties)` : ''), cents: HOUSE_SALE[houseSale].cents * n, quantity: n, unitCents: HOUSE_SALE[houseSale].cents });
  }
  if (serviceType === 'house_sale' && !houseSale) throw new Error('Please choose the kind of house sale');
  if ((serviceType === 'accounting_only' || serviceType === 'accounting_addon') && !accountingAddon) throw new Error('Please select an accounting service');
  if (serviceType === 'court_appearance' && !courtAppearance) throw new Error('Please select a court appearance service');
  if (!lines.length) throw new Error('Nothing selected');

  // 10810 cap across all ordinary services of a full probate case
  const capEstate = serviceType === 'full' ? Number(estateValueCents) : Number(capContext && capContext.estateValueCents);
  const capApplies = (serviceType === 'full' || (capContext && capContext.fullProbate)) && capEstate > 0;
  let capCents = null;
  if (capApplies) {
    capCents = statutoryFeeCents(capEstate);
    let room = Math.max(0, capCents - Number((capContext && capContext.priorOrdinaryCents) || 0));
    for (const l of lines) {
      if (!ORDINARY_KEYS.has(l.key)) continue;
      const allowed = Math.min(l.cents, room);
      if (allowed < l.cents) { l.listCents = l.cents; l.cents = allowed; l.cappedBy10810 = true; if (allowed === 0) l.included = true; }
      room -= allowed;
    }
  }
  const totalCents = lines.reduce((s, l) => s + l.cents, 0);
  const ordinaryCents = lines.filter(l => ORDINARY_KEYS.has(l.key)).reduce((s, l) => s + l.cents, 0);
  return { lines, totalCents, ordinaryCents, capCents: Number.isFinite(capCents) ? capCents : null, description: lines.map(l => l.label).join(' + '),
    feeBasis: fee ? fee.basis : (capApplies ? '10810' : null), estateValueCents: capApplies ? capEstate : (fee ? (fee.estateValueCents || null) : null) };
}

// The three charges of a 3-payment plan.
// installmentExact false (default, today's behavior): three equal charges of ceil(total/3).
// installmentExact true: ceil, ceil, remainder, so the three add up to the total exactly.
function installmentSchedule(totalCents, settings) {
  const first = Math.ceil(totalCents / 3);
  if (settings && settings.installmentExact === true) return [first, first, totalCents - 2 * first];
  return [first, first, first];
}

module.exports = { HOUSE_SALE, FULL_TIERS, fullProbateTier, ORDINARY_KEYS, BASE_CENTS, LABELS, buildOrder, installmentSchedule, courtCents, contestedCents, statutoryFeeCents, fullProbateFeeCents, estateValueFromIntake };
