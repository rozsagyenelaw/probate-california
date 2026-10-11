// Client money view (Rozsa's decision 7, final): card payments are paid out by Stripe to the OPERATING account and
// Rozsa moves the funds to the firm's client trust account herself. Per client this shows the amount paid, the amount
// earned as stages complete, every payment, refund and recorded move of earned funds, and what is earned but not yet
// recorded as moved out of trust. Nothing here implies that Stripe pays into trust.
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
const { statutoryFeeCents, fullProbateFeeCents } = require('./pricing');
// Ordinary services under Probate Code 10810 (fee, accounting, uncontested appearance); legacy rows: all but contested
const ordinaryOf = (p) => p.ordinaryCents != null ? Number(p.ordinaryCents) : ((p.courtAppearance && p.courtAppearance.kind === 'contested') ? 0 : Number(p.amountCents || 0));
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
  const balancePays = live.filter(p => p.serviceType === 'fee_balance');
  const probateFeeCents = (firstProbate ? Number(firstProbate.totalPriceCents || firstProbate.amountCents || 0) - Number(firstProbate.amountDiscountCents || 0) : 0) + sum(balancePays, p => p.amountCents);
  const stages = (STAGES[service] || []).map(s => ({ ...s, completedOn: st[s.key] || null }));
  const reached = stages.filter(s => s.completedOn);
  const pct = reached.length ? Math.max(...reached.map(s => s.pct)) : 0;

  const accountingPays = live.filter(p => p.addOns && p.addOns.accounting && !isProbate(p.serviceType));
  const courtPays = live.filter(p => p.courtAppearance);
  const appeared = new Set(st.hearingsAppeared || []);
  const accountingEarned = st.accountingDelivered ? sum(accountingPays, p => p.amountCents) : 0;
  const hearingEarned = sum(courtPays.filter(p => appeared.has(p.id) || (p.courtAppearance.hearingId && appeared.has(p.courtAppearance.hearingId))), p => p.amountCents);
  // When the inventory value is in and lower than the intake estimate, the 10810 limit on that value applies (full probate)
  const inventoryValueCents = Number(caseDoc.inventoryValueCents) || null;
  const capNowCents = service === 'full' && inventoryValueCents ? statutoryFeeCents(inventoryValueCents) : null;
  const probateBase = capNowCents != null ? Math.min(probateFeeCents, capNowCents) : probateFeeCents;
  const probateEarned = Math.round(probateBase * pct / 100);
  const ordinaryCharged = sum(payments, ordinaryOf) - sum(refunds, r => r.amountCents);
  const capRefundDueCents = capNowCents != null ? Math.max(0, ordinaryCharged - capNowCents) : 0;
  // Price tier / 10810 check once the inventory and appraisal is in (decisions sections 21 and 28): what the ordinary
  // services should total for the inventory value, against what was charged. Rozsa confirms any change; never automatic.
  let feeAdjustment = null;
  if (service === 'full' && inventoryValueCents) {
    const nowFee = fullProbateFeeCents(inventoryValueCents);
    const addOns = Math.max(0, ordinaryCharged - probateFeeCents);
    const shouldBe = Math.min(nowFee.cents + addOns, statutoryFeeCents(inventoryValueCents));
    const diff = shouldBe - ordinaryCharged;
    feeAdjustment = {
      inventoryValueCents, tierNow: nowFee.tier, feeNowCents: nowFee.cents, feePaidCents: probateFeeCents,
      ordinaryShouldBeCents: shouldBe, ordinaryChargedCents: ordinaryCharged,
      kind: diff < 0 ? 'refund' : (diff > 0 ? 'balance' : 'none'), amountCents: Math.abs(diff),
      confirmed: caseDoc.feeAdjustment && caseDoc.feeAdjustment.inventoryValueCents === inventoryValueCents ? caseDoc.feeAdjustment : null
    };
  }

  const deposited = sum(live, p => p.amountCents);
  const refunded = sum(refunds, r => r.amountCents);
  const transferred = sum(transfers, t => t.amountCents);
  const heldForClient = deposited - refunded - transferred;
  const earned = probateEarned + accountingEarned + hearingEarned;
  const readyToMove = Math.max(0, Math.min(earned - transferred, heldForClient));

  const entries = [
    ...live.map(p => ({ date: p.date, kind: 'payment', amountCents: p.amountCents, cardFeeCents: p.stripeFeeCents || null, description: p.description + (p.installment ? ` (payment ${p.installment.number} of 3)` : ''), ref: p.id })),
    ...refunds.map(r => ({ date: r.date, kind: 'refund', amountCents: -r.amountCents, description: r.reason || 'Refund', ref: r.id })),
    ...transfers.map(t => ({ date: t.date, kind: 'earned funds moved out of trust', amountCents: -t.amountCents, description: t.note || `Earned: ${t.stageLabel || t.stage || ''}`.trim(), ref: t.id }))
  ].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  // Accounting tier by the number of transactions in the client's estate ledger (decisions section 30): Simple $995
  // fewer than 50, Complex $1,995 for 50 or more. If the ledger shows the other tier, the difference is a refund or a
  // charge for Rozsa to confirm. For full probate the accounting stays inside the 10810 limit.
  let accountingAdjustment = null;
  const acctPay = accountingPays[0] || probatePays.find(p => p.addOns && p.addOns.accounting);
  const paidTier = (caseDoc.addOns && caseDoc.addOns.accounting) || (acctPay && acctPay.addOns && acctPay.addOns.accounting) || null;
  if (paidTier && Number.isInteger(caseDoc.ledgerTransactionCount)) {
    const PRICE = { simple: 99500, complex: 199500 };
    const shouldTier = caseDoc.ledgerTransactionCount >= 50 ? 'complex' : 'simple';
    let diff = PRICE[shouldTier] - PRICE[paidTier];
    if (diff > 0 && service === 'full') {
      const estate = inventoryValueCents || Number(caseDoc.estateValueCents) || 0;
      if (estate > 0) diff = Math.max(0, Math.min(diff, statutoryFeeCents(estate) - ordinaryCharged));
    }
    accountingAdjustment = { transactions: caseDoc.ledgerTransactionCount, paidTier, shouldTier, kind: diff < 0 ? 'refund' : (diff > 0 ? 'balance' : 'none'), amountCents: Math.abs(diff),
      confirmed: caseDoc.accountingAdjustment && caseDoc.accountingAdjustment.shouldTier === shouldTier ? caseDoc.accountingAdjustment : null };
  }

  return {
    service, probateFeeCents, stages, percentEarned: pct, accountingAdjustment,
    earned: { probateCents: probateEarned, accountingCents: accountingEarned, hearingsCents: hearingEarned, totalCents: earned },
    depositedCents: deposited, refundedCents: refunded, transferredCents: transferred,
    paidCents: deposited - refunded,           // amount paid by the client, after refunds
    heldForClientCents: heldForClient,         // paid, less refunds, less earned funds recorded as moved out of trust
    readyToMoveCents: readyToMove,             // earned and not yet recorded as moved out of trust
    inventoryValueCents, capUnder10810Cents: capNowCents, ordinaryChargedCents: ordinaryCharged,
    capRefundDueCents, // refund due because the inventory came in lower (Rozsa starts and confirms it in the refund screen)
    feeAdjustment,     // tier or 10810 change after the inventory: refund or balance due, for Rozsa to confirm
    entries
  };
}

module.exports = { STAGES, computeCaseTrust };
