// Defaults for Rozsa's 9 business questions. Same keys as src/config/businessDefaults.js and the
// portal's functions/businessDefaults.js. The live answers are in Firestore config/business.
// Until Rozsa answers, these keep current behavior and current amounts (no price change).
module.exports = {
  filingBy: null,
  accountingTierRule: null,            // null | 'estateSize' (under/over $500,000) | 'transactions' (under/over 50)
  contestedHearing: { offered: true, price: 600 }, // current behavior: offered at $600 (2-hour minimum)
  livingTrustOffers: 'keep-current',
  installmentExact: false,             // false: current amounts (3 x ceil(total/3)); true: 3 payments adding up exactly
  payFromEstate: false,
  experienceClaim: null,
  payoutAccount: null,
  lastWeekdaySlot: '13:30'
};
