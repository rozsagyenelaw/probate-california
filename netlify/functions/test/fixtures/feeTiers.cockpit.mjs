// Full probate price tiers (Rozsa's decisions section 28, 2026-10-11) and the Probate Code 10810 small-estate rule.
// Same math as W2-payments' netlify/functions/lib/pricing.js statutoryFeeCents. Source opened 2026-10-11:
// https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=10810
// "Estate value" = gross value of the property that goes through probate (what the inventory shows), 10810(b).

export const FULL_TIERS = [
  { key: 'tier1', upToCents: 100000000, feeCents: 399500, label: 'Probate estate up to $1,000,000' },
  { key: 'tier2', upToCents: 200000000, feeCents: 599500, label: '$1,000,000 to $2,000,000' },
  { key: 'tier3', upToCents: Infinity, feeCents: 799500, label: 'Over $2,000,000' }
];

// 10810(a): 4% of the first $100,000, 3% of the next $100,000, 2% of the next $800,000, 1% of the next $9,000,000,
// 0.5% of the next $15,000,000; above $25,000,000 the court decides (treated as above every tier fee).
export function statutoryFeeCents(valueCents) {
  const v = Math.max(0, Math.floor(Number(valueCents) || 0));
  const bands = [[10000000, 0.04], [10000000, 0.03], [80000000, 0.02], [900000000, 0.01], [1500000000, 0.005]];
  let left = v; let fee = 0;
  for (const [size, rate] of bands) { const part = Math.min(left, size); fee += part * rate; left -= part; if (left <= 0) break; }
  return left > 0 ? Infinity : Math.round(fee);
}

// Fee for a full probate estate: the tier fee; in the first tier, the lower of $3,995 and the 10810 amount.
export function fullProbateFee(valueCents) {
  const v = Math.floor(Number(valueCents) || 0);
  if (!(v > 0)) return { cents: FULL_TIERS[0].feeCents, tier: 'tier1', basis: 'flat', label: FULL_TIERS[0].label };
  const t = FULL_TIERS.find((x) => v <= x.upToCents);
  if (t.key === 'tier1') {
    const s = statutoryFeeCents(v);
    if (s < t.feeCents) return { cents: s, tier: 'tier1', basis: '10810', label: `${t.label} (Probate Code 10810 amount is lower)` };
  }
  return { cents: t.feeCents, tier: t.key, basis: 'tier', label: t.label };
}

// What changes when the filed inventory value differs from the value the client gave at checkout.
export function tierChange(caseDoc) {
  const full = !/simpl/i.test(String(caseDoc?.serviceType || ''));
  const intake = Number(caseDoc?.estateValueCents) || null;
  const inventory = Number(caseDoc?.inventoryValueCents) || null;
  if (!full) return { applies: false, reason: 'Simplified petition: one price, no tiers.' };
  if (!inventory) return { applies: false, reason: 'Enter the filed inventory and appraisal value first.' };
  const from = fullProbateFee(intake);
  const to = fullProbateFee(inventory);
  const delta = to.cents - from.cents;
  return {
    applies: true, intakeValueCents: intake, inventoryValueCents: inventory,
    fromFeeCents: from.cents, fromLabel: from.label, fromBasis: from.basis,
    toFeeCents: to.cents, toLabel: to.label, toBasis: to.basis,
    deltaCents: delta, kind: delta > 0 ? 'balance' : delta < 0 ? 'refund' : 'none',
    note: intake ? null : 'No estate value was recorded at checkout; the flat $3,995 is assumed as the starting fee.'
  };
}

// Accounting add-on tiers (decisions section 30): by the number of transactions in the accounting period.
// Simple $995 for fewer than 50; Complex $1,995 for 50 or more.
export const ACCOUNTING_TIERS = { simple: { cents: 99500, label: 'Simple (fewer than 50 transactions)' }, complex: { cents: 199500, label: 'Complex (50 or more transactions)' } };
export function accountingTierFor(count) { return Number(count) >= 50 ? 'complex' : 'simple'; }

// purchased: 'simple' | 'complex' | null; count: transactions in the client's estate ledger
export function accountingTierChange({ purchased, count }) {
  if (!purchased || !ACCOUNTING_TIERS[purchased]) return { applies: false, reason: 'No accounting add-on purchased.' };
  if (count == null) return { applies: false, reason: 'No estate ledger yet.' };
  const should = accountingTierFor(count);
  const delta = ACCOUNTING_TIERS[should].cents - ACCOUNTING_TIERS[purchased].cents;
  return { applies: true, purchased, count, should, fromCents: ACCOUNTING_TIERS[purchased].cents, toCents: ACCOUNTING_TIERS[should].cents, fromLabel: ACCOUNTING_TIERS[purchased].label, toLabel: ACCOUNTING_TIERS[should].label, deltaCents: delta, kind: delta > 0 ? 'charge' : delta < 0 ? 'refund' : 'none' };
}

// House sale add-on (decisions section 30): an extraordinary service (Cal. Rules of Court 7.703(c)(1)), outside the 10810 cap.
export function isHouseSalePayment(p) {
  return /house[_ -]?sale|sale_npa|sale_confirmation/i.test(String(p?.serviceType || '')) || /house sale|sale of (the )?(house|home|real property)/i.test(String(p?.description || ''));
}

// The house-sale part of a payment: $1,495 when the court confirms the sale, $995 by Notice of Proposed Action.
// A payment that is only the house sale uses its own amount; a bundled checkout uses the add-on price.
export function houseSalePart(p) {
  const text = `${p?.saleType || ''} ${p?.description || ''}`;
  const alone = /^house[_ -]?sale/i.test(String(p?.serviceType || ''));
  const confirmation = /confirm/i.test(text);
  const npa = /npa|proposed action/i.test(text);
  const price = confirmation ? 149500 : npa ? 99500 : null;
  const amt = p?.amountCents ?? p?.totalPaid ?? null;
  return { cents: alone && amt != null ? amt : price, saleType: confirmation ? 'confirmation' : npa ? 'npa' : null, label: confirmation ? 'House sale papers (court confirmation)' : npa ? 'House sale papers (Notice of Proposed Action)' : 'House sale papers' };
}
