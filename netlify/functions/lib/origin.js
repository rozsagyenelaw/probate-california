// The Stripe account is shared with livingtrustcalifornia.com, LivingTrustAmerica, prenupandpostnup.com and
// uncontestedcaliforniadivorce.com, and every webhook endpoint receives every account event. This module
// decides whether an event belongs to a MyProbateCA checkout. Anything else is ignored: 200, no write, no email.
//
// A checkout session is MyProbateCA's only when ALL of these hold:
//  1. metadata.app === 'probate' and metadata.site === 'myprobateca' (set by lib/checkout.js), or, for sessions
//     created before metadata.site existed, metadata.app === 'probate' (legacy);
//  2. its success_url is on a MyProbateCA host;
//  3. every line item is a MyProbateCA price: one of the STRIPE_PRICE_* ids of this site, or an inline price
//     whose product carries metadata.site === 'myprobateca'.
const SITE = 'myprobateca';
const PRICE_ENVS = ['STRIPE_PRICE_SIMPLIFIED_PROBATE', 'STRIPE_PRICE_FULL_PROBATE', 'STRIPE_PRICE_SIMPLE_ACCOUNTING', 'STRIPE_PRICE_COMPLEX_ACCOUNTING', 'STRIPE_PRICE_REMOTE_APPEARANCE', 'STRIPE_PRICE_CONTESTED_HEARING'];

function allowedHosts() {
  const hosts = ['myprobateca.com', 'www.myprobateca.com', 'california-probate.netlify.app'];
  try { if (process.env.URL) hosts.push(new URL(process.env.URL).host); } catch { /* ignore */ }
  return hosts;
}

function priceAllowlist() {
  return new Set(PRICE_ENVS.map(k => process.env[k]).filter(Boolean));
}

// Step 1 and 2: no Stripe call needed.
function checkSessionHeader(session) {
  const m = (session && session.metadata) || {};
  if (m.app !== 'probate') return { ok: false, reason: 'metadata.app is not probate' };
  if (m.site !== undefined && m.site !== SITE) return { ok: false, reason: 'metadata.site is not myprobateca' };
  let host = '';
  try { host = new URL(String(session.success_url || '').replace('{CHECKOUT_SESSION_ID}', 'x')).host; } catch { /* invalid */ }
  if (!allowedHosts().includes(host)) return { ok: false, reason: `success_url host ${host || '(none)'} is not MyProbateCA` };
  return { ok: true, legacy: m.site !== SITE };
}

// Step 3 on already-fetched line items (each with price.product expanded).
function checkLineItems(items) {
  if (!items || !items.length) return { ok: false, reason: 'no line items' };
  const allow = priceAllowlist();
  for (const li of items) {
    const price = li.price || {};
    const product = typeof price.product === 'object' && price.product ? price.product : {};
    const tagged = product.metadata && product.metadata.site === SITE;
    if (!allow.has(price.id) && !tagged) return { ok: false, reason: `line item price ${String(price.id || '').slice(-4)} is not a MyProbateCA price` };
  }
  return { ok: true };
}

async function isMyProbateCheckout(stripe, session) {
  const head = checkSessionHeader(session);
  if (!head.ok) return head;
  const li = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ['data.price.product'] });
  const items = checkLineItems(li.data);
  if (!items.ok) return items;
  return { ok: true, legacy: head.legacy };
}

module.exports = { SITE, isMyProbateCheckout, checkSessionHeader, checkLineItems, priceAllowlist };
