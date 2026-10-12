// What Stripe Checkout and the Stripe receipt say for each MyProbateCA line (decisions 2026-10-12, point 6).
// Every MyProbateCA line is sent to Stripe as an inline price with this name and description, so the wording lives
// here (reviewed, tested) and never in products saved in the Stripe dashboard.
// Scope (decisions 2026-10-10, section 9 and 10): the office prepares the court papers and clears the probate notes;
// the client is the petitioner, files the papers and represents himself or herself. A hearing appearance is optional
// limited scope representation ($500 per hearing, $600 when someone has filed an objection; decision 21).
// House style: no dashes, no consultation wording, no hourly wording.

const money = (cents) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

const FULL_SCOPE = 'Court papers for a California full probate, prepared by an attorney, with the probate notes cleared. You file them as the petitioner, representing yourself. A court hearing appearance and the final accounting are separate options.';

const FULL_TIER_TEXT = {
  'up-to-1m': { name: 'Full Probate (estates up to $1,000,000)', fee: 'Flat fee for estates up to $1,000,000.' },
  '1m-to-2m': { name: 'Full Probate (estates from $1,000,000 to $2,000,000)', fee: 'Flat fee for estates from $1,000,000 to $2,000,000.' },
  'over-2m': { name: 'Full Probate (estates over $2,000,000)', fee: 'Flat fee for estates over $2,000,000.' }
};

const TEXT = {
  simplified: {
    name: 'Simplified Probate (family home)',
    description: 'Court papers prepared by an attorney for the simplified court process for a family home (primary residence) valued up to $750,000, with the probate notes cleared. You file them as the petitioner, representing yourself.'
  },
  simple_accounting: {
    name: 'Simple Accounting (fewer than 50 transactions)',
    description: 'A court formatted probate accounting prepared by an attorney for you to file, for an accounting period with fewer than 50 transactions. If the records show 50 or more, the fee moves to Complex Accounting, as confirmed by Rozsa.'
  },
  complex_accounting: {
    name: 'Complex Accounting (50 or more transactions)',
    description: 'A court formatted probate accounting prepared by an attorney for you to file, for an accounting period with 50 or more transactions. If the records show fewer than 50, the fee moves to Simple Accounting and the difference is refunded, as confirmed by Rozsa.'
  },
  remote_appearance: {
    name: 'Court Hearing Appearance ($500 per hearing, limited scope)',
    description: 'Rozsa Gyene appears for you at one probate hearing as limited scope counsel, for that hearing only. You remain the petitioner. If the court moves the hearing to a new date, the appearance moves with it at no extra charge.'
  },
  contested_hearing: {
    name: 'Contested Hearing Appearance ($600 per hearing, limited scope)',
    description: 'Rozsa Gyene appears for you at one probate hearing where someone has filed an objection, as limited scope counsel for that hearing only. You remain the petitioner. If the court moves the hearing to a new date, the appearance moves with it at no extra charge.'
  },
  house_sale_npa: {
    name: 'House Sale Papers (Notice of Proposed Action)',
    description: 'Papers prepared by an attorney to sell a house in the estate by Notice of Proposed Action (form DE-165), with any probate notes on them cleared. You sign, give notice and file them. Any newspaper notice of the sale is paid to the newspaper. A hearing appearance is a separate option.'
  },
  house_sale_confirmation: {
    name: 'House Sale Papers (sale the court must confirm)',
    description: 'Papers prepared by an attorney for a sale the court must confirm: the report of sale and petition to confirm it (form DE-260), with its notice and order, and any probate notes on them cleared. You sign, give notice and file them. Any newspaper notice of the sale is paid to the newspaper. A hearing appearance is a separate option.'
  }
};

// Added to a court appearance line when the hearing is fewer than 7 days away (item m)
const SHORT_NOTICE_TEXT = 'Short notice: the hearing is fewer than 7 days away. Rozsa confirms within 1 business day; if she cannot appear on that date, this payment is refunded in full automatically.';

const BALANCE_TEXT = {
  fee: { name: 'Full Probate fee balance (estate value from the inventory)', description: 'The balance of your full probate fee after the inventory placed the estate in a higher fee tier, as confirmed by Rozsa.' },
  both: { name: 'Fee balance (fee tier and accounting)', description: 'The balance of your full probate fee after the inventory placed the estate in a higher fee tier, and of your accounting fee after the records showed 50 or more transactions, as confirmed by Rozsa.' },
  accounting: { name: 'Accounting fee balance (50 or more transactions)', description: 'The balance of your accounting fee after the records showed 50 or more transactions, as confirmed by Rozsa.' }
};

// line: one line of pricing.buildOrder (key, label, cents, basis, tier, cappedBy10810, listCents, quantity); ctx: { balanceFor }
function stripeTextFor(line, ctx) {
  const key = line.key;
  if (key === 'full') {
    const small = line.basis === '10810' || line.cappedBy10810;
    if (small) {
      return { name: 'Full Probate (small estate fee)', description: `${FULL_SCOPE} The fee is the lower of our flat fee and the amount California law sets for an estate of this size (Probate Code section 10810).` };
    }
    const t = FULL_TIER_TEXT[line.tier] || FULL_TIER_TEXT['up-to-1m'];
    return { name: t.name, description: `${FULL_SCOPE} ${t.fee}` };
  }
  if (key === 'fee_balance') {
    // balanceFor: 'fee', 'accounting' or 'fee,accounting' (create-checkout-session); admin-trust passes a label only
    const kinds = String((ctx && ctx.balanceFor) || '').split(',').filter(Boolean);
    const acct = kinds.length ? kinds.includes('accounting') : /accounting/i.test(String(line.label || ''));
    const fee = kinds.length ? kinds.includes('fee') : !acct;
    if (acct && fee) return BALANCE_TEXT.both;
    return acct ? BALANCE_TEXT.accounting : BALANCE_TEXT.fee;
  }
  if (key.startsWith('house_sale_')) {
    const t = TEXT[key];
    if (!t) return { name: line.label, description: undefined };
    const n = Number(line.quantity) || 1;
    return { name: n > 1 ? `${t.name} (${n} properties, ${money(line.unitCents || line.cents / n)} each)` : t.name, description: t.description };
  }
  const t0 = TEXT[key];
  if (!t0) return { name: line.label, description: undefined };
  // Short notice appearance (item m, decisions 2026-10-12 point 4): the hearing is fewer than 7 days away
  const t = (ctx && ctx.shortNotice && (key === 'remote_appearance' || key === 'contested_hearing'))
    ? { name: `${t0.name}, short notice`, description: `${t0.description} ${SHORT_NOTICE_TEXT}` }
    : t0;
  // an add-on brought below its list price by the 10810 limit on a full probate case
  if (line.cappedBy10810 && line.listCents) return { name: t.name, description: `${t.description} On your full probate case the total fee stays within the amount California law sets for the estate (Probate Code section 10810), so this charge is ${money(line.cents)} instead of ${money(line.listCents)}.` };
  return t;
}

module.exports = { stripeTextFor, TEXT, FULL_TIER_TEXT, BALANCE_TEXT, FULL_SCOPE, SHORT_NOTICE_TEXT };
