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

// Full probate fee: lower of the flat fee and the 10810 amount. Unknown or zero value: the flat fee.
function fullProbateFeeCents(estateValueCents) {
  const v = Math.floor(Number(estateValueCents) || 0);
  if (!(v > 0)) return { cents: BASE_CENTS.full, basis: 'flat' };
  const statutory = statutoryFeeCents(v);
  return statutory < BASE_CENTS.full ? { cents: statutory, basis: '10810', estateValueCents: v } : { cents: BASE_CENTS.full, basis: 'flat', estateValueCents: v };
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
function buildOrder({ serviceType, accountingAddon, courtAppearance, estateValueCents }, settings) {
  const lines = [];
  let fee = null;
  if (serviceType === 'full') {
    fee = fullProbateFeeCents(estateValueCents);
    lines.push({ key: 'full', label: LABELS.full, cents: fee.cents, basis: fee.basis });
  } else if (serviceType === 'simplified') {
    lines.push({ key: serviceType, label: LABELS[serviceType], cents: BASE_CENTS[serviceType] });
  } else if (!['accounting_only', 'accounting_addon', 'court_appearance'].includes(serviceType)) {
    throw new Error('Invalid service type selected');
  }
  if (accountingAddon) {
    if (!['simple', 'complex'].includes(accountingAddon)) throw new Error('Invalid accounting service selected');
    lines.push({ key: `${accountingAddon}_accounting`, label: LABELS[accountingAddon], cents: BASE_CENTS[`${accountingAddon}_accounting`] });
  }
  if (courtAppearance) {
    if (!['remote', 'contested'].includes(courtAppearance)) throw new Error('Invalid court appearance selected');
    const cents = courtCents(courtAppearance, settings);
    if (cents == null) throw new Error('Contested hearings are not offered online. Please call 818-337-4071.');
    lines.push({ key: courtAppearance === 'remote' ? 'remote_appearance' : 'contested_hearing', label: LABELS[courtAppearance], cents });
  }
  if ((serviceType === 'accounting_only' || serviceType === 'accounting_addon') && !accountingAddon) throw new Error('Please select an accounting service');
  if (serviceType === 'court_appearance' && !courtAppearance) throw new Error('Please select a court appearance service');
  if (!lines.length) throw new Error('Nothing selected');
  const totalCents = lines.reduce((s, l) => s + l.cents, 0);
  return { lines, totalCents, description: lines.map(l => l.label).join(' + '), feeBasis: fee ? fee.basis : null, estateValueCents: fee ? (fee.estateValueCents || null) : null };
}

// The three charges of a 3-payment plan.
// installmentExact false (default, today's behavior): three equal charges of ceil(total/3).
// installmentExact true: ceil, ceil, remainder, so the three add up to the total exactly.
function installmentSchedule(totalCents, settings) {
  const first = Math.ceil(totalCents / 3);
  if (settings && settings.installmentExact === true) return [first, first, totalCents - 2 * first];
  return [first, first, first];
}

module.exports = { BASE_CENTS, LABELS, buildOrder, installmentSchedule, courtCents, contestedCents, statutoryFeeCents, fullProbateFeeCents, estateValueFromIntake };
