// Stripe Checkout for the pricing page (/payment), dashboard add-ons (/request-accounting) and the
// standalone court appearance (/request-court-appearance). Amounts come from lib/pricing.js and
// config/business; the 3-payment plan is stopped after three charges by the webhook (lib/installments.js).
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDb, corsHeaders, verifyCaller } = require('./lib/firebaseAdmin');
const { getBusinessSettings, defaults } = require('./lib/business');
const { createCheckout, capContextForCase } = require('./lib/checkout');
const { recordIncluded } = require('./lib/recordPayment');
const { queueShortNoticeIncludedAlert } = require('./lib/paymentEmails');

// The balance Rozsa confirmed and made visible to the client, not yet paid (same rule as the client home's balanceDue()).
function confirmedBalance(c) {
  const out = { cents: 0, keys: [], label: '' };
  const f = c.feeTierChange;
  if (f && f.status === 'confirmed' && f.clientVisible === true && f.kind === 'balance' && Number(f.deltaCents) > 0 && !f.paid) { out.cents += Math.round(Number(f.deltaCents)); out.keys.push('fee'); }
  const a = c.accountingTierChange;
  if (a && a.status === 'confirmed' && a.clientVisible === true && a.kind === 'charge' && Number(a.deltaCents) > 0 && !a.paid) { out.cents += Math.round(Number(a.deltaCents)); out.keys.push('accounting'); }
  out.label = out.keys.length === 2 ? 'Balance due: fee level and final accounting adjustments'
    : out.keys[0] === 'accounting' ? 'Accounting adjustment (more transactions than expected)' : 'Full Probate fee adjustment (estate value from the inventory)';
  return out;
}

exports.confirmedBalance = confirmedBalance;
exports.handler = async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }; }

  try {
    if (body.serviceType === 'fee_balance') return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid service type selected' }) }; // admin only
    let db = null; let settings = defaults;
    try { db = getDb(); settings = await getBusinessSettings(db); } catch (e) { console.warn('Firestore unavailable, using default settings:', e.message); }

    // A signed-in caller's own account wins over an email typed in the body
    const caller = await verifyCaller(event).catch(() => null);
    const customerEmail = (caller && caller.email) || body.customerEmail || null;

    // Add-ons for an existing case must belong to the caller
    let caseId = body.caseId || '';
    let caseDoc = null;
    if (caseId && db) {
      const c = await db.collection('cases').doc(caseId).get();
      if (!c.exists || (caller && c.data().userId !== caller.uid)) caseId = '';
      else caseDoc = c.data();
    }
    // From the client home (W6 F33/F35): after paying, back to the client home thank-you page; Back from Stripe opens
    // the client home's "Add a service" page. Only for a signed-in client and their own case.
    const portal = body.returnTo === 'portal' && caller && caseId;
    const portalReturn = portal ? { successQuery: 'next=portal&kind=addon', cancelPath: '/add-service' } : {};

    // W6 N6: the client pays a balance Rozsa confirmed (fee tier or accounting tier change) online. The amount is read
    // from the case on the server; the client can never set it.
    if (body.serviceType === 'balance_due') {
      if (!caller || !caseDoc) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Please sign in again to pay the balance.' }) };
      const due = confirmedBalance(caseDoc);
      if (!due.cents) return { statusCode: 400, headers, body: JSON.stringify({ error: 'There is no balance to pay on your case.', code: 'no_balance' }) };
      const co = await createCheckout(stripe, db, { serviceType: 'fee_balance', balanceCents: due.cents, balanceLabel: due.label, balanceFor: due.keys.join(','), paymentPlan: 'full', customerEmail, caseId, userId: caller.uid, source: 'client-home-balance', ...portalReturn }, settings);
      console.log('Balance checkout created:', co.sessionId.slice(0, 12), due.keys.join(','));
      return { statusCode: 200, headers, body: JSON.stringify({ url: co.url, sessionId: co.sessionId }) };
    }

    // Add-ons on a full probate case stay within the Probate Code 10810 cap with what was already charged
    const capContext = ['accounting_addon', 'court_appearance', 'house_sale'].includes(body.serviceType) && caseId ? await capContextForCase(db, caseId) : null;
    const result = await createCheckout(stripe, db, {
      capContext,
      serviceType: body.serviceType,
      probateType: body.probateType || (['simplified', 'full'].includes(body.serviceType) ? body.serviceType : null),
      accountingAddon: body.accountingAddon || null,
      courtAppearance: body.courtAppearance || null,
      houseSale: ['npa', 'confirmation'].includes(body.houseSale) ? body.houseSale : null,
      houseSaleCount: body.houseSaleCount || 1,
      hearing: body.hearingDetails || null,
      hearingId: caseId && body.hearingId ? String(body.hearingId) : null,
      paymentPlan: body.paymentPlan,
      customerEmail,
      caseId,
      userId: caller ? caller.uid : '',
      promoCode: body.promoCode || null,
      // Full probate for a small estate: the 10810 amount when lower than $3,995 (lib/pricing.js)
      estateValueCents: body.estateValue != null && body.estateValue !== '' ? Math.round(Math.max(0, Number(String(body.estateValue).replace(/[$,\s]/g, '')) || 0) * 100) : null,
      feeAgreementRequestId: body.feeAgreementRequestId || null,
      estateRange: body.estateRange || null, // range picked at account creation (section 32)
      source: body.serviceType === 'court_appearance' ? 'court-appearance-page' : (body.serviceType === 'accounting_addon' ? 'accounting-page' : 'payment-page'),
      cancelPath: body.serviceType === 'court_appearance' ? '/request-court-appearance?canceled=true' : (body.serviceType === 'accounting_addon' ? '/request-accounting?canceled=true' : undefined),
      ...portalReturn
    }, settings);
    if (result.included) {
      // Nothing to pay: the 10810 cap already covers it. Record it on the case the same way a payment would.
      const r = await recordIncluded(db, { caseId, userId: caller ? caller.uid : null, email: customerEmail, serviceType: body.serviceType, accountingAddon: body.accountingAddon || null, courtAppearance: body.courtAppearance || null, hearing: body.hearingDetails || null, hearingId: caseId && body.hearingId ? String(body.hearingId) : null, order: result.order });
      if (result.order && result.order.appearanceCheck && result.order.appearanceCheck.shortNotice && caseId) {
        await queueShortNoticeIncludedAlert(db, { caseId, email: customerEmail, customerName: caseDoc && caseDoc.clientName, hearing: body.hearingDetails || null, courtAppearance: body.courtAppearance || null }).catch((e) => console.error('short notice alert:', e.message));
      }
      return { statusCode: 200, headers, body: JSON.stringify({ included: true, caseId, message: 'This is included in your fee. There is nothing more to pay.', recorded: r.id }) };
    }
    console.log('Stripe session created:', result.sessionId.slice(0, 12), body.serviceType, body.paymentPlan);
    return { statusCode: 200, headers, body: JSON.stringify({ url: result.url, sessionId: result.sessionId }) };
  } catch (error) {
    console.error('Stripe checkout error:', error.type || '', error.message);
    if (error.userFacing) return { statusCode: error.status || 400, headers, body: JSON.stringify({ error: error.message, code: error.code || null }) };
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again in a moment. If it keeps happening, send us a message from your client portal or use the contact details at the bottom of myprobateca.com.' }) };
  }
};
