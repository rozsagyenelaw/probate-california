// Item 32: revenue from real payments, for the admin revenue / billing screen. Admin only.
// POST { from?: 'YYYY-MM-DD', to?: 'YYYY-MM-DD', includeTest?: bool }
// Reads payments/{id} and refunds/{id} (shapes in notes/shared-data-model.md, W2-payments section).
const { getDb, corsHeaders, verifyCaller, isAdminToken } = require('./lib/firebaseAdmin');
const { BASE_CENTS } = require('./lib/pricing');

const isTestEmail = (e) => /^rozsagyenelaw1\+/i.test(String(e || ''));
const ymd = (t) => (t && t.toDate ? t.toDate().toISOString().slice(0, 10) : null);

// Every amount a MyProbateCA checkout can produce (any mix of package, accounting and court add-ons, or one installment)
function knownAmounts() {
  const pk = [0, BASE_CENTS.simplified, BASE_CENTS.full];
  const ac = [0, BASE_CENTS.simple_accounting, BASE_CENTS.complex_accounting];
  const ct = [0, BASE_CENTS.remote_appearance, 60000];
  const set = new Set();
  for (const a of pk) for (const b of ac) for (const c of ct) { const t = a + b + c; if (t) { set.add(t); set.add(Math.ceil(t / 3)); set.add(t - 2 * Math.ceil(t / 3)); } }
  return set;
}

exports.handler = async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  const caller = await verifyCaller(event);
  if (!isAdminToken(caller)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin only' }) };
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch { /* defaults */ }

  try {
    const db = getDb();
    const known = knownAmounts();
    const [paySnap, refSnap] = await Promise.all([db.collection('payments').get(), db.collection('refunds').get()]);
    const rows = paySnap.docs.map(d => {
      const p = d.data();
      const amount = p.amountCents != null ? p.amountCents : (p.totalPaid || 0);
      const live = p.livemode !== undefined ? !!p.livemode : String(p.stripeSessionId || '').startsWith('cs_live');
      const flags = [];
      if (!known.has(amount) && !(p.amountDiscountCents > 0)) flags.push('amount is not a MyProbateCA price');
      if (!p.userId && !p.caseId) flags.push('not linked to a client account');
      return {
        id: d.id, date: ymd(p.createdAt), email: p.email || null, userId: p.userId || null, caseId: p.caseId || null,
        description: p.description || p.serviceType || null, serviceType: p.serviceType || null, plan: p.paymentPlan || 'full',
        installment: p.installment || null, amountCents: amount, refundedCents: p.refundedCents || 0,
        netCents: amount - (p.refundedCents || 0), promoCode: p.promoCode || null, live, test: !live || isTestEmail(p.email), flags
      };
    }).filter(r => (body.includeTest ? true : !r.test))
      .filter(r => (!body.from || (r.date && r.date >= body.from)) && (!body.to || (r.date && r.date <= body.to)))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));

    const counted = rows.filter(r => !r.flags.includes('amount is not a MyProbateCA price'));
    const sum = (arr, k) => arr.reduce((s, r) => s + (r[k] || 0), 0);
    const byMonth = {}; const byService = {};
    for (const r of counted) {
      const m = (r.date || 'unknown').slice(0, 7);
      byMonth[m] = byMonth[m] || { grossCents: 0, refundedCents: 0, netCents: 0, count: 0 };
      byMonth[m].grossCents += r.amountCents; byMonth[m].refundedCents += r.refundedCents; byMonth[m].netCents += r.netCents; byMonth[m].count++;
      const s = r.description || 'other';
      byService[s] = byService[s] || { netCents: 0, count: 0 };
      byService[s].netCents += r.netCents; byService[s].count++;
    }
    const refunds = refSnap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: ymd(d.data().createdAt) }))
      .filter(r => body.includeTest || r.livemode);
    const plans = {};
    for (const r of rows) if (r.plan === 'installments' && r.installment) {
      const key = r.caseId || r.email;
      plans[key] = plans[key] || { email: r.email, caseId: r.caseId, paymentsMade: 0, paidCents: 0 };
      plans[key].paymentsMade = Math.max(plans[key].paymentsMade, r.installment.number || 1); plans[key].paidCents += r.amountCents;
    }
    return { statusCode: 200, headers, body: JSON.stringify({
      totals: { grossCents: sum(counted, 'amountCents'), refundedCents: sum(counted, 'refundedCents'), netCents: sum(counted, 'netCents'), payments: counted.length },
      needsReview: rows.filter(r => r.flags.length),
      byMonth, byService, installmentPlans: Object.values(plans), refunds, payments: rows.slice(0, 500),
      note: 'Totals count only amounts a MyProbateCA checkout can produce. Rows under needsReview are shown but not counted.'
    }) };
  } catch (err) {
    console.error('admin-revenue error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
