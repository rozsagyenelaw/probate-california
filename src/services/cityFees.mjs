// City page fee example (W6 item i, Rozsa 2026-10-11): every figure follows from Probate Code 10810 (4% of the first
// $100,000, 3% of the next $100,000, 2% of the next $800,000, 1% of the next $9,000,000) and the full probate price tier
// for that estate ($3,995 up to $1,000,000; $5,995 to $2,000,000; $7,995 over $2,000,000). No savings figure is ever
// shown next to the $2,495 simplified price.
import { statutoryFeeDollars, fullProbateFee } from './feeMath.mjs';

export function cityFeeExample(estateValueDollars) {
  const statutoryFee = statutoryFeeDollars(estateValueDollars);
  const f = fullProbateFee(estateValueDollars);
  const ourFee = f.fee;
  const difference = Math.max(0, Math.round((statutoryFee - ourFee) * 100) / 100);
  const percentLess = statutoryFee > 0 ? Math.floor((difference / statutoryFee) * 100) : 0;
  return { estateValue: Number(estateValueDollars) || 0, statutoryFee, ourFee, difference, percentLess, tierLabel: f.tier ? f.tier.label : 'up to $1,000,000' };
}
