#!/usr/bin/env node
// Sets up MyProbateCA's own Stripe account (Rozsa's decision 7, 2026-10-10). Idempotent: run it again and
// nothing is duplicated. No secret is ever printed.
//
//   STRIPE_TARGET_KEY=<from Secret Manager, never typed here> node scripts/stripe-account/setup-account.cjs \
//       --webhook-url https://myprobateca.com/.netlify/functions/stripe-webhook [--disable-webhook] [--secret-sink gsm:NAME]
//
// It creates or reuses, in the account the key belongs to:
//   1. the six MyProbateCA products and one-time prices at today's amounts (tagged metadata.site = myprobateca);
//   2. the webhook endpoint with exactly: checkout.session.completed, checkout.session.async_payment_succeeded,
//      invoice.paid, charge.refunded (the signing secret, shown by Stripe only once, goes straight to --secret-sink);
//   3. Klarna switched on in the default payment method configuration (card stays on).
// The 3-payment plan needs no Stripe object: lib/checkout.js creates it per purchase and lib/installments.js
// turns it into a 3-period subscription schedule. Bank accounts and payouts are never read or changed here.
const { execFileSync } = require('child_process');
const path = require('path');
const Stripe = require(require.resolve('stripe', { paths: [path.join(__dirname, '..', '..')] }));

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const KEY = process.env.STRIPE_TARGET_KEY || '';
if (!/^(sk|rk)_(test|live)_/.test(KEY)) { console.error('STRIPE_TARGET_KEY is not set to a Stripe secret key.'); process.exit(1); }
const mode = KEY.includes('_live_') ? 'live' : 'test';
const OLD_ACCOUNT_SUFFIX = 'ya6t'; // the shared account (five businesses): never set up here
const stripe = Stripe(KEY);
const WEBHOOK_URL = arg('--webhook-url') || 'https://myprobateca.com/.netlify/functions/stripe-webhook';
const EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'invoice.paid', 'charge.refunded'];

const CATALOG = [
  { key: 'simplified', env: 'STRIPE_PRICE_SIMPLIFIED_PROBATE', name: 'Simplified Probate', cents: 249500 },
  { key: 'full', env: 'STRIPE_PRICE_FULL_PROBATE', name: 'Full Probate', cents: 399500 },
  { key: 'simple_accounting', env: 'STRIPE_PRICE_SIMPLE_ACCOUNTING', name: 'Simple Accounting', cents: 99500 },
  { key: 'complex_accounting', env: 'STRIPE_PRICE_COMPLEX_ACCOUNTING', name: 'Complex Accounting', cents: 199500 },
  { key: 'remote_appearance', env: 'STRIPE_PRICE_REMOTE_APPEARANCE', name: 'Remote Court Appearance', cents: 50000 },
  { key: 'contested_hearing', env: 'STRIPE_PRICE_CONTESTED_HEARING', name: 'Contested Hearing (2-hour minimum)', cents: 60000 }
];

async function all(listFn, params) { const out = []; for await (const x of listFn(params)) out.push(x); return out; }

(async () => {
  const acct = await stripe.accounts.retrieve();
  // The shared account may only be used in TEST mode, to prove this script before the new account exists.
  if (acct.id.endsWith(OLD_ACCOUNT_SUFFIX) && !(mode === 'test' && args.includes('--allow-shared-sandbox'))) { console.error('This key belongs to the shared Stripe account. Use the new MyProbateCA account key.'); process.exit(2); }
  const report = { mode, account: `...${acct.id.slice(-4)}`, businessName: (acct.settings && acct.settings.dashboard && acct.settings.dashboard.display_name) || acct.business_profile?.name || null,
    chargesEnabled: acct.charges_enabled, payoutsEnabled: acct.payouts_enabled, products: [], webhook: null, klarna: null };

  // 1. Products and prices
  const products = await all((p) => stripe.products.list(p), { limit: 100, active: true });
  for (const item of CATALOG) {
    let prod = products.find(p => p.metadata && p.metadata.site === 'myprobateca' && p.metadata.mpca_key === item.key);
    if (!prod) prod = await stripe.products.create({ name: item.name, metadata: { site: 'myprobateca', mpca_key: item.key } });
    const prices = await all((p) => stripe.prices.list(p), { product: prod.id, active: true, limit: 100 });
    let price = prices.find(p => p.unit_amount === item.cents && p.currency === 'usd' && p.type === 'one_time');
    if (!price) price = await stripe.prices.create({ product: prod.id, unit_amount: item.cents, currency: 'usd', metadata: { site: 'myprobateca', mpca_key: item.key } });
    if (prod.default_price !== price.id) await stripe.products.update(prod.id, { default_price: price.id });
    report.products.push({ env: item.env, price: price.id, amount: item.cents, name: item.name });
  }

  // 2. Webhook endpoint
  const endpoints = await all((p) => stripe.webhookEndpoints.list(p), { limit: 100 });
  let ep = endpoints.find(e => e.url === WEBHOOK_URL);
  let created = false;
  if (!ep) { ep = await stripe.webhookEndpoints.create({ url: WEBHOOK_URL, enabled_events: EVENTS, description: 'MyProbateCA: payments, installments, refunds' }); created = true; }
  else if (EVENTS.some(e => !ep.enabled_events.includes(e)) || ep.enabled_events.length !== EVENTS.length) ep = await stripe.webhookEndpoints.update(ep.id, { enabled_events: EVENTS });
  if (args.includes('--disable-webhook') && ep.status !== 'disabled') ep = await stripe.webhookEndpoints.update(ep.id, { disabled: true });
  if (created) {
    const sink = arg('--secret-sink');
    if (sink && sink.startsWith('gsm:')) {
      const name = sink.slice(4);
      const gcloud = process.env.GCLOUD || `${process.env.HOME}/Downloads/google-cloud-sdk/bin/gcloud`;
      let exists = true; try { execFileSync(gcloud, ['secrets', 'describe', name, '--project', 'probate-california'], { stdio: 'ignore' }); } catch { exists = false; }
      execFileSync(gcloud, exists ? ['secrets', 'versions', 'add', name, '--project', 'probate-california', '--data-file=-'] : ['secrets', 'create', name, '--project', 'probate-california', '--replication-policy=automatic', '--data-file=-'], { input: ep.secret, stdio: ['pipe', 'ignore', 'inherit'] });
      report.webhookSecretSavedTo = `Secret Manager ${name}`;
    } else report.webhookSecretSavedTo = 'not saved (no --secret-sink; the endpoint can be rolled in the Dashboard to get a new secret)';
  }
  report.webhook = { id: `...${ep.id.slice(-4)}`, url: ep.url, status: ep.status, events: ep.enabled_events, created };

  // 3. Klarna on in the default payment method configuration
  const cfgs = await stripe.paymentMethodConfigurations.list({ limit: 20 });
  const def = cfgs.data.find(c => c.is_default) || cfgs.data[0];
  if (def) {
    if (def.klarna && def.klarna.display_preference && def.klarna.display_preference.preference !== 'on') {
      await stripe.paymentMethodConfigurations.update(def.id, { klarna: { display_preference: { preference: 'on' } } });
    }
    const after = await stripe.paymentMethodConfigurations.retrieve(def.id);
    report.klarna = { available: after.klarna && after.klarna.available, value: after.klarna && after.klarna.display_preference && after.klarna.display_preference.value };
  }
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error('Setup stopped:', e.message); process.exit(1); });
