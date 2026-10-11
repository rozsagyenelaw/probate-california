// Pure fee math for the payment pages. Must match netlify/functions/lib/pricing.js and the cockpit's
// functions/shared/feeTiers.mjs (netlify/functions/test/fee-parity.test.js checks all three).
// Full probate fee for small estates (Rozsa, 2026-10-10): the lower of $3,995 and the Probate Code section 10810
// amount on the estate value (same rule as netlify/functions/lib/pricing.js; source opened on leginfo 2026-10-10).
export function statutoryFeeDollars(estateValueDollars) {
  let left = Math.max(0, Number(estateValueDollars) || 0); let fee = 0;
  for (const [size, rate] of [[100000, 0.04], [100000, 0.03], [800000, 0.02], [9000000, 0.01], [15000000, 0.005]]) {
    const part = Math.min(left, size); fee += part * rate; left -= part; if (left <= 0) break;
  }
  return left > 0 ? Infinity : Math.round(fee * 100) / 100;
}
// Full probate price tiers (decisions section 28): up to $1,000,000 $3,995 (and below that never more than the
// 10810 amount); $1,000,000 to $2,000,000 $5,995; over $2,000,000 $7,995. Same rule as netlify/functions/lib/pricing.js.
export const FULL_PROBATE_TIERS = [
  { upTo: 1000000, fee: 3995, label: 'up to $1,000,000' },
  { upTo: 2000000, fee: 5995, label: '$1,000,000 to $2,000,000' },
  { upTo: Infinity, fee: 7995, label: 'over $2,000,000' }
];
export function fullProbateFee(estateValueDollars) {
  const v = Number(estateValueDollars) || 0;
  if (!(v > 0)) return { fee: 3995, reduced: false, known: false, tier: null };
  const tier = FULL_PROBATE_TIERS.find(t => v <= t.upTo);
  const s = statutoryFeeDollars(v);
  return s < tier.fee ? { fee: s, reduced: true, known: true, tier } : { fee: tier.fee, reduced: false, known: true, tier };
}
