// Builds the Stripe Checkout Session for every MyProbateCA purchase (pricing page, intake, add-ons,
// standalone court appearance). Used by create-checkout-session.js and submit-intake.js.
const { buildOrder, installmentSchedule } = require('./pricing');
const { stripeTextFor } = require('./stripeText');
const { checkHearingDate, hearingDateMessage } = require('./courtDays');

const PORTAL_BASE = 'https://portal.myprobateca.com';

class UserError extends Error { constructor(msg, status = 400) { super(msg); this.userFacing = true; this.status = status; } }

// Compact hearing details for Checkout metadata (Stripe allows 500 characters per value).
function packHearing(h) {
  if (!h) return '';
  const o = {
    d: String(h.hearingDate || h.date || '').slice(0, 10),
    t: String(h.hearingTime || h.time || '').slice(0, 5),
    dept: String(h.department || '').slice(0, 30),
    cn: String(h.caseNumber || '').slice(0, 40),
    co: String(h.county || '').slice(0, 40),
    ty: String(h.hearingType || h.type || '').slice(0, 40),
    x: String(h.otherDescription || '').slice(0, 150)
  };
  return JSON.stringify(o).slice(0, 500);
}

// Every line goes to Stripe as an inline price whose product name and description come from lib/stripeText.js
// (decisions 2026-10-12, point 6). The products saved in the Stripe dashboard (STRIPE_PRICE_*) carried old wording
// ("estates over $750,000", "11 phases", "2-hour minimum") and are no longer used for new checkouts; lib/origin.js
// still accepts them for sessions created before this change.
function lineItemFor(line, ctx) {
  const t = stripeTextFor(line, ctx);
  const product_data = { name: t.name, metadata: { site: 'myprobateca', line: line.key } };
  if (t.description) product_data.description = t.description;
  return { price_data: { currency: 'usd', product_data, unit_amount: line.cents }, quantity: 1 };
}

async function resolvePromo(stripe, db, code) {
  if (!code) return null;
  const normalized = String(code).toUpperCase().trim();
  // 1) Firestore promoCodes (admin-managed) mapping to a Stripe coupon
  if (db) {
    try {
      const snap = await db.collection('promoCodes').where('code', '==', normalized).where('isActive', '==', true).limit(1).get();
      if (!snap.empty) {
        const p = snap.docs[0].data();
        const expired = p.expirationDate && p.expirationDate.toDate && new Date() > p.expirationDate.toDate();
        const used = p.maxUses && p.usageCount >= p.maxUses;
        if (!expired && !used && p.stripeCouponId) return { discount: { coupon: p.stripeCouponId }, code: normalized };
      }
    } catch (e) { console.warn('promoCodes lookup failed:', e.message); }
  }
  // 2) Stripe promotion codes (created in the Stripe dashboard)
  const list = await stripe.promotionCodes.list({ code: normalized, active: true, limit: 1 });
  if (list.data.length) return { discount: { promotion_code: list.data[0].id }, code: normalized };
  // Stripe codes are case sensitive; try as typed
  if (normalized !== String(code).trim()) {
    const l2 = await stripe.promotionCodes.list({ code: String(code).trim(), active: true, limit: 1 });
    if (l2.data.length) return { discount: { promotion_code: l2.data[0].id }, code: String(code).trim() };
  }
  throw new UserError('That promo code is not valid. Please check it, or continue without it.');
}

// The signed fee agreement for this purchase (shape from W2-fee's checkout step, shared-data-model.md W2-fee section):
// signatureRequests/{id}: kind 'fee_agreement', stage 'checkout', status 'signed', clientEmail, and
// order { service, accountingAddon, courtAppearance, paymentPlan, estateValueCents, feeCents, totalCents }.
// It must be signed, for this email, and for exactly this purchase and fee (the small-estate fee included).
async function requireSignedFeeAgreement(db, params, order) {
  const id = String(params.feeAgreementRequestId || '');
  const fail = () => { const e = new UserError('Please sign your fee agreement first. It is the step just before payment.', 409); e.code = 'fee_agreement_required'; throw e; };
  if (!id || !db) fail();
  const snap = await db.collection('signatureRequests').doc(id).get();
  if (!snap.exists) fail();
  const r = snap.data();
  const o = r.order || {};
  // Signed earlier in the flow (account -> agreement -> questionnaire -> payment, decisions section 32): the agreement
  // carries the tier table and the adjustment sentence, so it covers the fee the questionnaire sets, the payment plan
  // and add-ons chosen later. It must be this client's, signed, and for the same service.
  const ok = r.kind === 'fee_agreement' && r.status === 'signed'
    && String(r.clientEmail || '').toLowerCase() === String(params.customerEmail || '').toLowerCase()
    && o.service === params.serviceType;
  if (!ok) fail();
  return id;
}

// For an add-on bought later on a FULL probate case with a known estate value: what the 10810 cap leaves.
async function capContextForCase(db, caseId) {
  if (!db || !caseId) return null;
  const c = await db.collection('cases').doc(caseId).get();
  if (!c.exists || c.data().serviceType !== 'full') return null;
  const pays = (await db.collection('payments').where('caseId', '==', caseId).get()).docs.map(d => d.data());
  const withValue = pays.find(p => Number(p.estateValueCents) > 0);
  const estateValueCents = Number(c.data().estateValueCents) || (withValue ? Number(withValue.estateValueCents) : 0);
  if (!(estateValueCents > 0)) return null;
  const ordinaryOf = (p) => {
    if (p.ordinaryCents != null) return Number(p.ordinaryCents);
    // rows written before ordinaryCents existed: everything but a contested hearing is ordinary
    if (p.courtAppearance && p.courtAppearance.kind === 'contested') return 0;
    return Number(p.amountCents || p.totalPaid || 0);
  };
  const priorOrdinaryCents = pays.reduce((s2, p) => s2 + ordinaryOf(p) - Math.min(Number(p.refundedCents || 0), ordinaryOf(p)), 0);
  return { fullProbate: true, estateValueCents, priorOrdinaryCents };
}

// params: { serviceType, probateType, accountingAddon, courtAppearance, hearing, paymentPlan, customerEmail, caseId, promoCode, userId, source }
async function createCheckout(stripe, db, params, settings) {
  const paymentPlan = params.paymentPlan === 'installments' ? 'installments' : (params.paymentPlan === 'full' ? 'full' : null);
  if (!paymentPlan) throw new UserError('Invalid payment plan selected');
  // Full probate: the fee depends on the estate value (price tiers), so it is required before checkout
  if (params.serviceType === 'full' && !(Number(params.estateValueCents) > 0) && !['up-to-1m', '1m-to-2m', 'over-2m'].includes(params.estateRange)) {
    const e = new UserError('Please enter about how much the estate is worth, so we can show your exact fee before you pay.'); e.code = 'estate_value_required'; throw e;
  }
  let order;
  try { order = buildOrder(params, settings); } catch (e) { throw new UserError(e.message); }

  // Fee agreement signed BEFORE payment, inside the checkout flow (config/business.feeAgreementEnabled).
  // Required for the probate fee itself; add-ons bought later are covered by the signed agreement.
  let feeAgreementId = null;
  if (settings && settings.feeAgreementEnabled === true && ['simplified', 'full'].includes(params.serviceType)) {
    feeAgreementId = await requireSignedFeeAgreement(db, params, order);
  }
  if (paymentPlan === 'installments' && params.serviceType === 'house_sale') throw new UserError('House sale papers are paid in one payment.');
  // Standalone court appearances are paid in full (a hearing date is too close for a 3-month plan)
  if (paymentPlan === 'installments' && params.serviceType === 'court_appearance') throw new UserError('A court appearance is paid in one payment.');

  // Court appearance (Rozsa, 2026-10-12): the hearing must be at least 2 court days away, counted in Pacific time
  // (weekends and court holidays skipped). Fewer than 7 days away is short notice: the office confirms within
  // 1 business day, or the payment is refunded in full automatically (admin-hearing 'appearance-decline').
  if (params.courtAppearance && (params.serviceType === 'court_appearance' || params.hearing)) {
    const h = params.hearing || {};
    const check = checkHearingDate(String(h.hearingDate || h.date || '').slice(0, 10), params.now || new Date());
    if (!check.ok) { const e = new UserError(hearingDateMessage(check)); e.code = `hearing_${check.reason.replace(/-/g, '_')}`; throw e; }
    order.appearanceCheck = { shortNotice: check.shortNotice, daysAway: check.daysAway };
  }

  const mode = paymentPlan === 'full' ? 'payment' : 'subscription';
  // Everything in this order is included under the 10810 cap: nothing to charge, no Stripe checkout
  if (order.totalCents === 0) return { included: true, order };
  const amounts = mode === 'subscription' ? installmentSchedule(order.totalCents, settings) : null;
  // The names shown on Checkout, also used as the payment description (Stripe dashboard and receipt)
  const stripeNames = order.lines.filter(l => l.cents > 0).map(l => stripeTextFor(l, { balanceFor: params.balanceFor }).name).join(' + ');
  const line_items = [];
  if (mode === 'payment') {
    for (const l of order.lines) if (l.cents > 0) line_items.push(lineItemFor(l, { balanceFor: params.balanceFor, shortNotice: !!(order.appearanceCheck && order.appearanceCheck.shortNotice) }));
  } else {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `${stripeNames} (3 monthly payments)`, metadata: { site: 'myprobateca' }, description: `Total $${(amounts.reduce((a, b) => a + b, 0) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} in 3 monthly payments. Stops after the third payment.` },
        unit_amount: amounts[0],
        recurring: { interval: 'month', interval_count: 1 }
      },
      quantity: 1
    });
  }

  const promo = await resolvePromo(stripe, db, params.promoCode);
  const baseUrl = process.env.URL || 'https://myprobateca.com';
  const chargedToday = mode === 'payment' ? order.totalCents : amounts[0];
  const metadata = {
    app: 'probate',
    site: 'myprobateca',
    serviceType: params.serviceType,
    probateType: params.probateType || '',
    accountingAddon: params.accountingAddon || '',
    courtAppearance: params.courtAppearance || '',
    houseSale: params.houseSale ? `${params.houseSale}:${Math.max(1, Math.min(10, Math.floor(Number(params.houseSaleCount) || 1)))}` : '',
    hearing: packHearing(params.hearing),
    hearingId: String(params.hearingId || '').slice(0, 120), // W6 F38: the hearing picked in the client home
    shortNotice: order.appearanceCheck && order.appearanceCheck.shortNotice ? '1' : '',
    // Item v: the probate fee line and how it was priced (answers, the first-screen range, or the default $3,995)
    feeCents: String(((order.lines || []).find(l => l.key === 'full' || l.key === 'simplified') || {}).cents || ''),
    pricedFrom: params.pricedFrom || '',
    balanceFor: params.balanceFor || '', // W6 N6: 'fee', 'accounting' or both, for a confirmed balance paid online
    paymentPlan,
    caseId: params.caseId || '',
    userId: params.userId || '',
    source: params.source || '',
    customerEmail: params.customerEmail || '',
    promoCode: promo ? promo.code : '',
    totalAmountCents: String(order.totalCents),
    installmentAmounts: amounts ? amounts.join(',') : '',
    feeBasis: order.feeBasis || '',
    ordinaryCents: String(order.ordinaryCents || 0),
    includedUnder10810: order.lines.filter(l => l.included).map(l => l.key).join(','),
    estateValueCents: order.estateValueCents ? String(order.estateValueCents) : '',
    feeAgreementRequestId: feeAgreementId || ''
  };
  const cfg = {
    mode,
    line_items,
    payment_method_types: mode === 'payment' ? ['card', 'klarna'] : ['card'],
    // US dollars only: no adaptive pricing (no local-currency conversion), so the amount in trust equals the fee exactly
    adaptive_pricing: { enabled: false },
    // next=portal: back to the thank-you page in the client home (kind=addon for a service added from the client home)
    success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&amount=${(chargedToday / 100).toFixed(2)}${params.successQuery === 'next=portal' ? '&next=portal' : (params.successQuery === 'next=portal&kind=addon' ? '&next=portal&kind=addon' : '')}`,
    // Item q (point 10): Stripe's Back never lands on the old /payment page; it goes to the client home
    cancel_url: params.cancelPath ? `${baseUrl}${params.cancelPath}` : `${PORTAL_BASE}/?tab=payments`,
    metadata
  };
  if (params.stripeCustomerId) cfg.customer = params.stripeCustomerId; else cfg.customer_email = params.customerEmail || undefined;
  if (mode === 'payment') {
    cfg.payment_intent_data = { receipt_email: params.customerEmail || undefined, metadata, description: stripeNames };
  } else {
    cfg.subscription_data = { metadata: { ...metadata, totalPayments: '3' }, description: `${order.description}: 3 monthly payments` };
    // W6 R9/R18: Stripe shows a plan as a monthly subscription. Say plainly, next to the pay button, that it is three
    // payments and stops by itself (the webhook ends the plan after the third charge: lib/installments.js).
    const m = (c) => `$${(c / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    cfg.custom_text = { submit: { message: `This is a 3-payment plan, not a subscription: ${m(amounts[0])} today, then ${m(amounts[1])} and ${m(amounts[2])} one and two months from now, ${m(amounts.reduce((a, b) => a + b, 0))} in all. It stops by itself after the third payment. There is nothing to cancel.` } };
  }
  if (promo) cfg.discounts = [promo.discount]; else cfg.allow_promotion_codes = true;

  const session = await stripe.checkout.sessions.create(cfg);
  return { url: session.url, sessionId: session.id, order, amounts, chargedToday };
}

module.exports = { capContextForCase, createCheckout, UserError, packHearing, resolvePromo, requireSignedFeeAgreement };
