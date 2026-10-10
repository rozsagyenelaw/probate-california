// Builds the Stripe Checkout Session for every MyProbateCA purchase (pricing page, intake, add-ons,
// standalone court appearance). Used by create-checkout-session.js and submit-intake.js.
const { buildOrder, installmentSchedule } = require('./pricing');

class UserError extends Error { constructor(msg, status = 400) { super(msg); this.userFacing = true; this.status = status; } }

const PRICE_ENV = {
  simplified: 'STRIPE_PRICE_SIMPLIFIED_PROBATE',
  full: 'STRIPE_PRICE_FULL_PROBATE',
  simple_accounting: 'STRIPE_PRICE_SIMPLE_ACCOUNTING',
  complex_accounting: 'STRIPE_PRICE_COMPLEX_ACCOUNTING',
  remote_appearance: 'STRIPE_PRICE_REMOTE_APPEARANCE',
  contested_hearing: 'STRIPE_PRICE_CONTESTED_HEARING'
};

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

// Use the Stripe price for a line when its amount matches what we charge; otherwise inline price_data.
async function lineItemFor(stripe, line) {
  const id = process.env[PRICE_ENV[line.key]];
  if (id && !id.includes('REPLACE_ME')) {
    try {
      const p = await stripe.prices.retrieve(id);
      if (p.active && p.unit_amount === line.cents && p.currency === 'usd' && p.type === 'one_time') return { price: id, quantity: 1 };
      console.warn(`Stripe price ${id.slice(-4)} amount ${p.unit_amount} differs from ${line.cents}; using inline price`);
    } catch (e) { console.warn('price lookup failed:', e.message); }
  }
  return { price_data: { currency: 'usd', product_data: { name: line.label, metadata: { site: 'myprobateca' } }, unit_amount: line.cents }, quantity: 1 };
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

// params: { serviceType, probateType, accountingAddon, courtAppearance, hearing, paymentPlan, customerEmail, caseId, promoCode, userId, source }
async function createCheckout(stripe, db, params, settings) {
  const paymentPlan = params.paymentPlan === 'installments' ? 'installments' : (params.paymentPlan === 'full' ? 'full' : null);
  if (!paymentPlan) throw new UserError('Invalid payment plan selected');
  let order;
  try { order = buildOrder(params, settings); } catch (e) { throw new UserError(e.message); }
  // Standalone court appearances are paid in full (a hearing date is too close for a 3-month plan)
  if (paymentPlan === 'installments' && params.serviceType === 'court_appearance') throw new UserError('A court appearance is paid in one payment.');

  const mode = paymentPlan === 'full' ? 'payment' : 'subscription';
  const amounts = mode === 'subscription' ? installmentSchedule(order.totalCents, settings) : null;
  const line_items = [];
  if (mode === 'payment') {
    for (const l of order.lines) line_items.push(await lineItemFor(stripe, l));
  } else {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `${order.description} (3 monthly payments)`, metadata: { site: 'myprobateca' }, description: `Total $${(amounts.reduce((a, b) => a + b, 0) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} in 3 monthly payments. Stops after the third payment.` },
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
    hearing: packHearing(params.hearing),
    paymentPlan,
    caseId: params.caseId || '',
    userId: params.userId || '',
    source: params.source || '',
    customerEmail: params.customerEmail || '',
    promoCode: promo ? promo.code : '',
    totalAmountCents: String(order.totalCents),
    installmentAmounts: amounts ? amounts.join(',') : ''
  };
  const cfg = {
    mode,
    line_items,
    payment_method_types: mode === 'payment' ? ['card', 'klarna'] : ['card'],
    success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&amount=${(chargedToday / 100).toFixed(2)}`,
    cancel_url: params.cancelPath ? `${baseUrl}${params.cancelPath}` : `${baseUrl}/payment?canceled=true`,
    metadata
  };
  if (params.stripeCustomerId) cfg.customer = params.stripeCustomerId; else cfg.customer_email = params.customerEmail || undefined;
  if (mode === 'payment') {
    cfg.payment_intent_data = { receipt_email: params.customerEmail || undefined, metadata, description: order.description };
  } else {
    cfg.subscription_data = { metadata: { ...metadata, totalPayments: '3' }, description: `${order.description}: 3 monthly payments` };
  }
  if (promo) cfg.discounts = [promo.discount]; else cfg.allow_promotion_codes = true;

  const session = await stripe.checkout.sessions.create(cfg);
  return { url: session.url, sessionId: session.id, order, amounts, chargedToday };
}

module.exports = { createCheckout, UserError, packHearing, resolvePromo };
