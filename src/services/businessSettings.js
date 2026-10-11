// Reads Rozsa's business answers (Firestore config/business) over the defaults in src/config/businessDefaults.js.
import { useEffect, useState } from 'react';
import businessDefaults from '../config/businessDefaults';

// config/business is publicly readable, so it is read with one REST call instead of the Firebase SDK:
// public pages (home, FAQ) then do not have to download and start Firebase just to show prices.
const PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'probate-california';
const DB_PATH = `projects/${PROJECT}/databases/(default)/documents`;
// batchGet answers 200 even while the document does not exist yet (no 404 in the console)
const BATCH_GET_URL = `https://firestore.googleapis.com/v1/${DB_PATH}:batchGet`;
function fromFirestoreValue(v) {
  if (!v || typeof v !== 'object') return null;
  if ('nullValue' in v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromFirestoreValue(x)]));
  return null;
}

let cached = null;
export async function loadBusinessSettings() {
  if (cached) return cached;
  let live = {};
  try {
    const r = await fetch(BATCH_GET_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documents: [`${DB_PATH}/config/business`] }) });
    if (r.ok) {
      const found = ((await r.json()) || []).find((x) => x && x.found);
      if (found) live = fromFirestoreValue({ mapValue: { fields: found.found.fields || {} } }) || {};
    }
  } catch { /* public read not available yet: defaults */ }
  const merged = { ...businessDefaults };
  for (const k of Object.keys({ ...businessDefaults, ...live })) if (live[k] !== undefined && live[k] !== null) merged[k] = live[k];
  if (merged.feeAgreementEnabled === undefined) merged.feeAgreementEnabled = false;
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
  if (rule === 'transactions') return tier === 'simple' ? 'Fewer than 50 transactions' : '50 or more transactions';
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
export const parseDollars = (txt) => { const f = parseFloat(String(txt || '').replace(/[$,\s]/g, '')); return Number.isFinite(f) && f > 0 ? f : 0; };

// Full probate: the fee, the accounting add-on and an uncontested (remote) appearance together never exceed the
// Probate Code 10810 amount on the estate value (decisions section 21). Same rule as netlify/functions/lib/pricing.js.
// Returns the amounts actually charged, in dollars. A contested hearing is not capped.
export function capOrdinaryDollars(estateValueDollars, { fee = 0, accounting = 0, remote = 0 }) {
  const v = Number(estateValueDollars) || 0;
  if (!(v > 0)) return { fee, accounting, remote, capped: false };
  let room = statutoryFeeDollars(v);
  const take = (x) => { const a = Math.min(x, room); room -= a; return Math.round(a * 100) / 100; };
  const out = { fee: take(fee), accounting: take(accounting), remote: take(remote) };
  out.capped = out.fee < fee || out.accounting < accounting || out.remote < remote;
  return out;
}
