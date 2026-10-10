// Shared business settings (Rozsa's 9 questions, asked 2026-10-10).
// The live values are in the Firestore document config/business (public read, admin write).
// These defaults apply until she answers. Keep the same keys in all three copies:
//   probate-california/src/config/businessDefaults.js
//   myprobateca-portal/src/config/businessDefaults.js
//   myprobateca-portal/functions/businessDefaults.js
// Never hard-code an answer anywhere else; read it through these keys.
export const BUSINESS_DEFAULTS = Object.freeze({
  // 1. Who files with the court. null: say "we prepare your court documents", no claim about filing.
  filingBy: null,
  // 2. Accounting add-on tier split. null: show both tiers without the split rule.
  accountingTierRule: null,
  // 3. Contested hearings: current behavior (offered at the current $600 checkout amount).
  contestedHearing: Object.freeze({ offered: true, price: 600 }),
  // 4. Living trust offers on the probate site.
  livingTrustOffers: 'keep-current',
  // 5. Three-payment plan adds up exactly to the price. false: current amounts.
  installmentExact: false,
  // 6. Pay part of the fee from the estate after Letters. false: not built.
  payFromEstate: false,
  // 7. "500+ Cases" or "5,000+ Families". null: current text unchanged.
  experienceClaim: null,
  // 8. Stripe payouts to operating or client trust account. null: fee agreement shows both in brackets.
  payoutAccount: null,
  // 9. Last weekday consultation start (24-hour Pacific time).
  lastWeekdaySlot: '13:30'
});

export const BUSINESS_CONFIG_DOC = ['config', 'business'];

// Live value for one key: config/business wins when the field is present, else the default.
export function businessSetting(liveDoc, key) {
  if (liveDoc && Object.prototype.hasOwnProperty.call(liveDoc, key)) return liveDoc[key];
  return BUSINESS_DEFAULTS[key];
}

export default BUSINESS_DEFAULTS;
