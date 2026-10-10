// Reads Rozsa's business answers (Firestore config/business) over the defaults in src/config/businessDefaults.js.
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import businessDefaults from '../config/businessDefaults';

let cached = null;
export async function loadBusinessSettings() {
  if (cached) return cached;
  let live = {};
  try { const s = await getDoc(doc(db, 'config', 'business')); if (s.exists()) live = s.data() || {}; } catch { /* public read not available yet: defaults */ }
  const merged = { ...businessDefaults };
  for (const k of Object.keys(businessDefaults)) if (live[k] !== undefined && live[k] !== null) merged[k] = live[k];
  merged.contestedHearing = { ...businessDefaults.contestedHearing, ...(live.contestedHearing || {}) };
  merged.refundPolicyText = live.refundPolicyText || null;
  cached = merged;
  return merged;
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState(cached || { ...businessDefaults, refundPolicyText: null });
  useEffect(() => { let on = true; loadBusinessSettings().then(s => on && setSettings(s)); return () => { on = false; }; }, []);
  return settings;
}

// One refund policy line everywhere money is taken. Placeholder until the fee agreement (W2-fee, item 23)
// is approved; then Rozsa's approved text goes in config/business.refundPolicyText.
export const REFUND_POLICY_PLACEHOLDER = 'Any part of the fee that has not been earned is refunded, as set out in your signed fee agreement.';
export const refundPolicyText = (s) => (s && s.refundPolicyText) || REFUND_POLICY_PLACEHOLDER;

// Accounting tiers: the split rule follows config/business.accountingTierRule (null: no split shown).
export function accountingTierNote(rule, tier) {
  if (rule === 'estateSize') return tier === 'simple' ? 'For estates under $500,000' : 'For estates of $500,000 or more';
  if (rule === 'transactions') return tier === 'simple' ? 'Under 50 transactions' : '50 or more transactions';
  return null;
}

// Contested hearing: offered and price follow config/business.contestedHearing.
export const contestedOffered = (s) => !(s && s.contestedHearing && s.contestedHearing.offered === false);
export const contestedPrice = (s) => Number((s && s.contestedHearing && s.contestedHearing.price) || 600);

// The three charges of the 3-payment plan, in dollars, exactly as Stripe charges them
// (same rule as netlify/functions/lib/pricing.js installmentSchedule).
export function installmentAmounts(totalDollars, s) {
  const total = Math.round(totalDollars * 100);
  const first = Math.ceil(total / 3);
  const cents = s && s.installmentExact === true ? [first, first, total - 2 * first] : [first, first, first];
  return cents.map(c => c / 100);
}
export const fmtDollars = (d) => Number(d).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(Number(d)) ? 0 : 2, maximumFractionDigits: 2 });
