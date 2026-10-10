// Client trust ledger (Rozsa's decision 7, 2026-10-10): the MyProbateCA fee is deposited in the firm's client
// trust account and stays there until earned; each stage's part is withdrawn when the stage is complete;
// anything unearned is refunded. This module computes, per client and case, every deposit, transfer and refund,
// what is earned, and what is ready to move from trust to operating.
// It never stores or shows a bank account number, routing number or bank balance: only this client's own figures.

// Earning stages = the approved refund stages in W2-fee's fee agreement (src/config/feeTerms.js REFUND_POLICY_POINTS,
// portal functions/feeAgreement/text.js). Cumulative percent of the probate flat fee earned when the stage is complete.
const STAGES = {
  full: [
    { key: 'petitionDelivered', pct: 40, label: 'Petition and supporting documents delivered for signature' },
    { key: 'notesAnswered', pct: 60, label: "Court's probate notes answered and order and letters prepared" },
    { key: 'inventoryDelivered', pct: 80, label: 'Inventory and appraisal delivered' },
    { key: 'finalPetitionDelivered', pct: 100, label: 'Petition for final distribution delivered' }
  ],
  simplified: [
    { key: 'petitionDelivered', pct: 60, label: 'Petition delivered for signature' },
    { key: 'notesAnswered', pct: 100, label: "Court's probate notes answered and proposed order prepared" }
  ]
};
// Add-ons: the accounting is earned when delivered; a hearing appearance fee when the Firm appears at that hearing.

const isProbate = (t) => t === 'simplified' || t === 'full';
const sum = (arr, f) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0);

// caseDoc: cases/{id}; payments, refunds, transfers: rows for this case.
// caseDoc.feeStages: { petitionDelivered: 'YYYY-MM-DD', notesAnswered, inventoryDelivered, finalPetitionDelivered,
//                      accountingDelivered, hearingsAppeared: [hearingId or paymentId] } (set by the admin)
function computeCaseTrust(caseDoc, payments, refunds, transfers) {
  const service = caseDoc.serviceType === 'simplified' ? 'simplified' : 'full';
  const st = caseDoc.feeStages || {};
  const live = payments;

  const probatePays = live.filter(p => isProbate(p.serviceType));
  const firstProbate = probatePays.find(p => p.totalPriceCents) || probatePays[0];
  const probateFeeCents = firstProbate ? Number(firstProbate.totalPriceCents || firstProbate.amountCents || 0) - Number(firstProbate.amountDiscountCents || 0) : 0;
  const stages = (STAGES[service] || []).map(s => ({ ...s, completedOn: st[s.key] || null }));
  const reached = stages.filter(s => s.completedOn);
  const pct = reached.length ? Math.max(...reached.map(s => s.pct)) : 0;

  const accountingPays = live.filter(p => p.addOns && p.addOns.accounting && !isProbate(p.serviceType));
  const courtPays = live.filter(p => p.courtAppearance);
  const appeared = new Set(st.hearingsAppeared || []);
  const accountingEarned = st.accountingDelivered ? sum(accountingPays, p => p.amountCents) : 0;
  const hearingEarned = sum(courtPays.filter(p => appeared.has(p.id) || (p.courtAppearance.hearingId && appeared.has(p.courtAppearance.hearingId))), p => p.amountCents);
  const probateEarned = Math.round(probateFeeCents * pct / 100);

  const deposited = sum(live, p => p.amountCents);
  const refunded = sum(refunds, r => r.amountCents);
  const transferred = sum(transfers, t => t.amountCents);
  const heldForClient = deposited - refunded - transferred;
  const earned = probateEarned + accountingEarned + hearingEarned;
  const readyToMove = Math.max(0, Math.min(earned - transferred, heldForClient));

  const entries = [
    ...live.map(p => ({ date: p.date, kind: 'deposit', amountCents: p.amountCents, cardFeeCents: p.stripeFeeCents || null, description: p.description + (p.installment ? ` (payment ${p.installment.number} of 3)` : ''), ref: p.id })),
    ...refunds.map(r => ({ date: r.date, kind: 'refund', amountCents: -r.amountCents, description: r.reason || 'Refund', ref: r.id })),
    ...transfers.map(t => ({ date: t.date, kind: 'transfer to operating', amountCents: -t.amountCents, description: t.note || `Earned: ${t.stageLabel || t.stage || ''}`.trim(), ref: t.id }))
  ].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  return {
    service, probateFeeCents, stages, percentEarned: pct,
    earned: { probateCents: probateEarned, accountingCents: accountingEarned, hearingsCents: hearingEarned, totalCents: earned },
    depositedCents: deposited, refundedCents: refunded, transferredCents: transferred,
    heldForClientCents: heldForClient, readyToMoveCents: readyToMove, entries
  };
}

module.exports = { STAGES, computeCaseTrust };
