// Defaults for Rozsa's business questions, as she answered them on 2026-10-10 (notes/00-ROZSA-DECISIONS-2026-10-10.md).
// Same keys as src/config/businessDefaults.js and the portal's functions/businessDefaults.js.
// The live values are in Firestore config/business, which wins when a key is present.
module.exports = {
  filingBy: 'client',
  accountingTierRule: 'transactions', // decisions section 30
  contestedHearing: { offered: true, price: 600 }, // unchanged
  livingTrustOffers: 'keep-current',
  installmentExact: true,              // three payments add up exactly to the price
  payFromEstate: false,
  experienceClaim: '500+ Cases',
  payoutAccount: 'trust',              // takes effect with MyProbateCA's own Stripe account
  lastWeekdaySlot: '13:30',
  feeAgreementEnabled: false           // W2-fee's switch: the fee agreement is signed inside checkout, before payment
};
