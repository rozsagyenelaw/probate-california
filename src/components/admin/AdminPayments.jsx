import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, RefreshCw, RotateCcw, AlertTriangle, Search, X, Loader2 } from 'lucide-react';

// Revenue from real Stripe payments (netlify/functions/admin-revenue.js) and refunds started here
// (netlify/functions/admin-refund.js, with a typed confirmation step).
const money = (c) => '$' + ((c || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function callFn(user, name, body) {
  const idToken = await user.getIdToken();
  const r = await fetch(`/.netlify/functions/${name}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` }, body: JSON.stringify(body || {}) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(data.error || `Error ${r.status}`); e.data = data; throw e; }
  return data;
}

const RefundDialog = ({ user, payment, onClose, onDone }) => {
  const [quote, setQuote] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [phrase, setPhrase] = useState('');
  const [stopPlan, setStopPlan] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    callFn(user, 'admin-refund', { action: 'quote', paymentId: payment.id })
      .then(q => { setQuote(q); setAmount((q.maxRefundCents / 100).toFixed(2)); })
      .catch(e => setError(e.message));
  }, [user, payment.id]);

  const cents = Math.round(parseFloat(amount || '0') * 100);
  const expected = `REFUND ${money(cents)}`;

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const r = await callFn(user, 'admin-refund', { action: 'refund', paymentId: payment.id, amountCents: cents, reason, confirmPhrase: phrase, stopPlan: quote?.installmentPlan ? stopPlan : false, requestId: `${payment.id}-${Date.now()}` });
      setResult(r); onDone();
    } catch (e) { setError(e.message); }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="refund-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" data-testid="refund-dialog">
        <div className="flex justify-between items-start mb-4">
          <h2 id="refund-title" className="text-lg font-bold text-gray-900">Refund a payment</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        {!quote && !error && <p className="text-gray-600"><Loader2 className="inline h-4 w-4 animate-spin mr-2" />Checking the payment with Stripe...</p>}
        {quote && !result && (
          <div className="space-y-4 text-sm">
            <div className="bg-gray-50 rounded p-3">
              <p><strong>{quote.description}</strong> for {quote.email}</p>
              <p>Paid {money(quote.paidCents)}. Already refunded {money(quote.alreadyRefundedCents)}. Most you can refund: <strong>{money(quote.maxRefundCents)}</strong>.</p>
              {!quote.livemode && <p className="text-amber-700 mt-1">Stripe test mode payment.</p>}
            </div>
            <p className="text-gray-600"><span className="font-medium">Refund policy{quote.policyApproved ? '' : ' (placeholder until the fee agreement is approved)'}:</span> {quote.policyText}</p>
            <label className="block">Amount to refund (full or part)
              <input type="number" step="0.01" min="0.01" max={(quote.maxRefundCents / 100).toFixed(2)} value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <label className="block">Reason (kept on the payment record)
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            {quote.installmentPlan && (
              <label className="flex items-center"><input type="checkbox" checked={stopPlan} onChange={e => setStopPlan(e.target.checked)} className="mr-2" />Also stop the remaining monthly payments</label>
            )}
            <label className="block">To confirm, type <code className="bg-gray-100 px-1">{expected}</code>
              <input value={phrase} onChange={e => setPhrase(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" data-testid="refund-confirm" />
            </label>
            {error && <p className="text-red-700">{error}</p>}
            <button onClick={submit} disabled={busy || phrase.trim() !== expected || !reason.trim() || cents <= 0 || cents > quote.maxRefundCents}
              className="w-full py-3 rounded bg-red-700 text-white font-medium disabled:bg-gray-300">
              {busy ? 'Refunding...' : `Refund ${money(cents)}`}
            </button>
          </div>
        )}
        {result && (
          <div className="text-sm space-y-2" data-testid="refund-result">
            <p className="text-green-700 font-medium">Refunded {money(result.amountCents)}. Stripe status: {result.status}.</p>
            <p>Recorded on the payment and the case. Client email: {result.clientEmailed ? 'sent' : 'not sent'}.{result.planStopped ? ' Remaining monthly payments stopped.' : ''}</p>
            <button onClick={onClose} className="mt-2 px-4 py-2 rounded bg-gray-100">Close</button>
          </div>
        )}
        {error && !quote && <p className="text-red-700 text-sm">{error}</p>}
      </div>
    </div>
  );
};

const AdminPayments = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [includeTest, setIncludeTest] = useState(false);
  const [search, setSearch] = useState('');
  const [refunding, setRefunding] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try { setData(await callFn(user, 'admin-revenue', { includeTest })); } catch (e) { setError(e.message); }
    setLoading(false);
  }, [user, includeTest]);
  useEffect(() => { load(); }, [load]);

  const rows = (data?.payments || []).filter(p => !search || `${p.email} ${p.description}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500">Real payments received through Stripe</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 flex items-center"><input type="checkbox" className="mr-2" checked={includeTest} onChange={e => setIncludeTest(e.target.checked)} />Show test payments</label>
          <button onClick={load} className="flex items-center px-3 py-2 border rounded text-sm"><RefreshCw className="h-4 w-4 mr-1" />Refresh</button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="revenue-totals">
        {[['Received', data?.totals.grossCents], ['Refunded', data?.totals.refundedCents], ['Net', data?.totals.netCents], ['Payments', null]].map(([label, v]) => (
          <div key={label} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900">{loading ? '...' : (v === null ? (data?.totals.payments ?? 0) : money(v))}</p>
          </div>
        ))}
      </div>

      {data?.needsReview?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm" data-testid="needs-review">
          <p className="font-medium text-amber-900 flex items-center"><AlertTriangle className="h-4 w-4 mr-2" />Needs your review (shown, not counted in the totals)</p>
          <ul className="mt-2 space-y-1">
            {data.needsReview.map(r => <li key={r.id}>{r.date} {r.email} {money(r.amountCents)}: {r.flags.join('; ')}</li>)}
          </ul>
        </div>
      )}

      {data?.installmentPlans?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
          <p className="font-medium text-gray-900 mb-2">3-payment plans</p>
          {data.installmentPlans.map(p => <p key={p.caseId || p.email}>{p.email}: {p.paymentsMade} of 3 paid ({money(p.paidCents)})</p>)}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or service" className="w-full pl-9 pr-3 py-2 border rounded" />
        </div>
        {loading ? <p className="p-6 text-gray-500">Loading...</p> : rows.length === 0 ? (
          <p className="p-6 text-gray-500">No payments yet.</p>
        ) : (
          <ul className="divide-y" data-testid="payments-list">
            {rows.map(p => (
              <li key={p.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 break-words">{p.description}{p.installment ? ` (payment ${p.installment.number} of 3)` : ''}</p>
                  <p className="text-sm text-gray-500 break-all">{p.date} {p.email}{p.promoCode ? ` · code ${p.promoCode}` : ''}{p.test ? ' · test' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{money(p.amountCents)}</p>
                    {p.refundedCents > 0 && <p className="text-xs text-red-700">refunded {money(p.refundedCents)}</p>}
                  </div>
                  {p.refundedCents < p.amountCents && (
                    <button onClick={() => setRefunding(p)} className="flex items-center px-3 py-2 border border-red-300 text-red-700 rounded text-sm" data-testid={`refund-${p.id}`}>
                      <RotateCcw className="h-4 w-4 mr-1" />Refund
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-500 flex items-center"><DollarSign className="h-3 w-3 mr-1" />{data?.note}</p>
      {refunding && <RefundDialog user={user} payment={refunding} onClose={() => setRefunding(null)} onDone={load} />}
    </div>
  );
};

export default AdminPayments;
