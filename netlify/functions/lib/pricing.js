// One place for what each service costs (cents) and how a 3-payment plan is split.
// Amounts are today's amounts. They change only when Rozsa answers (config/business).

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
function buildOrder({ serviceType, accountingAddon, courtAppearance }, settings) {
  const lines = [];
  if (serviceType === 'simplified' || serviceType === 'full') {
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
  return { lines, totalCents, description: lines.map(l => l.label).join(' + ') };
}

// The three charges of a 3-payment plan.
// installmentExact false (default, today's behavior): three equal charges of ceil(total/3).
// installmentExact true: ceil, ceil, remainder, so the three add up to the total exactly.
function installmentSchedule(totalCents, settings) {
  const first = Math.ceil(totalCents / 3);
  if (settings && settings.installmentExact === true) return [first, first, totalCents - 2 * first];
  return [first, first, first];
}

module.exports = { BASE_CENTS, LABELS, buildOrder, installmentSchedule, courtCents, contestedCents };
