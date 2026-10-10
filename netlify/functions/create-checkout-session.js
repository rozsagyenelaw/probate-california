// Stripe Checkout for the pricing page (/payment), dashboard add-ons (/request-accounting) and the
// standalone court appearance (/request-court-appearance). Amounts come from lib/pricing.js and
// config/business; the 3-payment plan is stopped after three charges by the webhook (lib/installments.js).
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDb, corsHeaders, verifyCaller } = require('./lib/firebaseAdmin');
const { getBusinessSettings, defaults } = require('./lib/business');
const { createCheckout } = require('./lib/checkout');

exports.handler = async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }; }

  try {
    let db = null; let settings = defaults;
    try { db = getDb(); settings = await getBusinessSettings(db); } catch (e) { console.warn('Firestore unavailable, using default settings:', e.message); }

    // A signed-in caller's own account wins over an email typed in the body
    const caller = await verifyCaller(event).catch(() => null);
    const customerEmail = (caller && caller.email) || body.customerEmail || null;

    // Add-ons for an existing case must belong to the caller
    let caseId = body.caseId || '';
    if (caseId && db) {
      const c = await db.collection('cases').doc(caseId).get();
      if (!c.exists || (caller && c.data().userId !== caller.uid)) caseId = '';
    }

    const result = await createCheckout(stripe, db, {
      serviceType: body.serviceType,
      probateType: body.probateType || (['simplified', 'full'].includes(body.serviceType) ? body.serviceType : null),
      accountingAddon: body.accountingAddon || null,
      courtAppearance: body.courtAppearance || null,
      hearing: body.hearingDetails || null,
      paymentPlan: body.paymentPlan,
      customerEmail,
      caseId,
      userId: caller ? caller.uid : '',
      promoCode: body.promoCode || null,
      source: body.serviceType === 'court_appearance' ? 'court-appearance-page' : (body.serviceType === 'accounting_addon' ? 'accounting-page' : 'payment-page'),
      cancelPath: body.serviceType === 'court_appearance' ? '/request-court-appearance?canceled=true' : (body.serviceType === 'accounting_addon' ? '/request-accounting?canceled=true' : undefined)
    }, settings);
    console.log('Stripe session created:', result.sessionId.slice(0, 12), body.serviceType, body.paymentPlan);
    return { statusCode: 200, headers, body: JSON.stringify({ url: result.url, sessionId: result.sessionId }) };
  } catch (error) {
    console.error('Stripe checkout error:', error.type || '', error.message);
    if (error.userFacing) return { statusCode: error.status || 400, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'An error occurred processing your request. Please try again or call 818-337-4071.' }) };
  }
};
