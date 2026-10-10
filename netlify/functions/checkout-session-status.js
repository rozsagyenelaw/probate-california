// Read-only check used by /payment-success to record the purchase conversion even when the buyer
// comes back from Stripe signed out. Given a Stripe Checkout session id (unguessable, from the
// success URL) it answers only whether that session was paid and the amount charged. It returns no
// name, email, case or payment details, and it never changes anything in Stripe.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return respond(405, { error: 'method' });
  const id = (event.queryStringParameters && event.queryStringParameters.session_id) || '';
  if (!SESSION_ID.test(id)) return respond(400, { error: 'session' });
  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    const paid = s.status === 'complete' && (s.payment_status === 'paid' || s.payment_status === 'no_payment_required');
    return respond(200, {
      paid,
      amount: typeof s.amount_total === 'number' ? s.amount_total / 100 : null,
      currency: (s.currency || 'usd').toUpperCase(),
      service: (s.metadata && (s.metadata.serviceType || s.metadata.service_type)) || null,
    });
  } catch {
    // Unknown or expired session: same answer as unpaid, no detail
    return respond(404, { paid: false });
  }
};
