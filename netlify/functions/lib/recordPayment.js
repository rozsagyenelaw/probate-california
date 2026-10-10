// What the Stripe webhook writes to Firestore. Shapes are documented in
// notes/shared-data-model.md under "W2-payments section".
//  payments/{checkoutSessionId or invoiceId}  one row per real charge (idempotent on Stripe retries)
//  refunds/{refundId}                          one row per refund
//  cases/{id}.billing                          { totalCharged, totalPaid, totalRefunded, balanceDue } in cents
const { admin } = require('./firebaseAdmin');
const { unpackHearing, hearingEntry, legacyHearingDetails } = require('./hearings');
const { enforceThreePayments, stopAfterThirdPayment } = require('./installments');
const { LABELS } = require('./pricing');

const FV = admin.firestore.FieldValue;
const isProbate = (t) => t === 'simplified' || t === 'full';

function describe(meta) {
  const parts = [];
  if (isProbate(meta.serviceType)) parts.push(LABELS[meta.serviceType]);
  if (meta.accountingAddon) parts.push(LABELS[meta.accountingAddon]);
  if (meta.courtAppearance) parts.push(LABELS[meta.courtAppearance]);
  return parts.join(' + ') || 'MyProbateCA service';
}

function orderNumber() { return '#PCA' + Date.now().toString().slice(-8); }

async function findUser(db, userId, email) {
  if (userId) { const d = await db.collection('users').doc(userId).get(); if (d.exists) return d; }
  if (!email) return null;
  const s = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
  return s.empty ? null : s.docs[0];
}

async function newestCase(db, uid) {
  const s = await db.collection('cases').where('userId', '==', uid).get();
  const docs = s.docs.filter(d => !d.data().archived).sort((a, b) => ((b.data().createdAt && b.data().createdAt.toMillis()) || 0) - ((a.data().createdAt && a.data().createdAt.toMillis()) || 0));
  return docs[0] || null;
}

// checkout.session.completed for app === 'probate'
async function recordCheckout(stripe, db, session) {
  const meta = session.metadata || {};
  const email = (session.customer_email || (session.customer_details && session.customer_details.email) || meta.customerEmail || '').toLowerCase();
  const payRef = db.collection('payments').doc(session.id);
  if ((await payRef.get()).exists) return { duplicate: true };

  const probate = isProbate(meta.serviceType);
  const installments = meta.paymentPlan === 'installments';
  const amounts = (meta.installmentAmounts || '').split(',').filter(Boolean).map(Number);
  const totalPrice = Number(meta.totalAmountCents) || session.amount_total;
  const status = installments ? 'installments_active' : 'paid';
  const desc = describe(meta);
  const order = orderNumber();
  const hearing = unpackHearing(meta.hearing);

  const userDoc = await findUser(db, meta.userId, email);
  const uid = userDoc ? userDoc.id : null;

  // Which case this belongs to
  let caseRef = null;
  if (meta.caseId) { const c = await db.collection('cases').doc(meta.caseId).get(); if (c.exists && (!uid || c.data().userId === uid)) caseRef = c.ref; }
  if (!caseRef && uid) {
    const c = await newestCase(db, uid);
    if (c) caseRef = c.ref;
    else if (probate) {
      caseRef = db.collection('cases').doc();
      await caseRef.set({
        userId: uid, clientEmail: email, status: 'intake_pending', paymentStatus: status,
        serviceType: meta.serviceType, addOns: { accounting: meta.accountingAddon || null },
        orderNumber: order, source: 'payment', createdAt: FV.serverTimestamp(), paidAt: FV.serverTimestamp()
      });
    }
  }

  const payment = {
    email, userId: uid, caseId: caseRef ? caseRef.id : null,
    serviceType: meta.serviceType || 'full',
    probateType: probate ? meta.serviceType : null,
    addOns: { accounting: meta.accountingAddon || null },
    courtAppearance: meta.courtAppearance ? { kind: meta.courtAppearance, hearing: hearing || null, matchedToCase: !!caseRef } : null,
    description: desc,
    paymentPlan: installments ? 'installments' : 'full',
    amountCents: session.amount_total,
    totalPaid: session.amount_total, // legacy name, cents
    amountDiscountCents: (session.total_details && session.total_details.amount_discount) || 0,
    promoCode: meta.promoCode || null,
    totalPriceCents: totalPrice,
    feeBasis: meta.feeBasis || null,           // '10810' when the small-estate amount applied
    estateValueCents: meta.estateValueCents ? Number(meta.estateValueCents) : null,
    feeAgreementRequestId: meta.feeAgreementRequestId || null, // W2-fee's portal trigger links the signed agreement
    installment: installments ? { number: 1, of: 3, amounts } : null,
    paymentStatus: status,
    refundedCents: 0,
    orderNumber: order,
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent || null,
    stripeSubscriptionId: session.subscription || null,
    stripeCustomerId: session.customer || null,
    livemode: !!session.livemode,
    source: meta.source || null,
    createdAt: FV.serverTimestamp()
  };
  try { await payRef.create(payment); } catch (e) {
    if (e.code === 6 || /already exists/i.test(e.message)) return { duplicate: true }; // Stripe retry raced us
    throw e;
  }

  // The client's account
  if (userDoc) {
    const u = { updatedAt: FV.serverTimestamp() };
    if (probate) {
      Object.assign(u, {
        paymentStatus: status, serviceType: meta.serviceType, probateType: meta.serviceType,
        paymentPlan: installments ? 'installments' : 'full', amountPaid: session.amount_total, orderNumber: order,
        paidAt: FV.serverTimestamp(), stripeSessionId: session.id,
        installmentsPaid: installments ? 1 : 0, installmentsRemaining: installments ? 2 : 0
      });
    } else {
      // Add-on: never touch the probate package, its status or the amount paid for it
      u.lastAddOnPaidAt = FV.serverTimestamp();
    }
    if (meta.accountingAddon) u['addOns.accounting'] = meta.accountingAddon;
    if (caseRef) u.currentCaseId = caseRef.id;
    await userDoc.ref.update(u);
  } else {
    // Guest without an account yet: the portal creates it and sends the welcome email
    await db.collection('accountRequests').add({ email, name: (session.customer_details && session.customer_details.name) || '', source: 'payment', orderNumber: order, createdAt: FV.serverTimestamp() });
  }

  // The case
  if (caseRef) {
    const c = {
      updatedAt: FV.serverTimestamp(),
      'billing.totalCharged': FV.increment(installments ? (amounts.length === 3 ? amounts.reduce((a, b) => a + b, 0) : totalPrice) : session.amount_total),
      'billing.totalPaid': FV.increment(session.amount_total),
      lastPaymentAt: FV.serverTimestamp()
    };
    if (probate) {
      Object.assign(c, { paymentStatus: status, serviceType: meta.serviceType, paidAt: FV.serverTimestamp(), 'payment.plan': installments ? 'installments' : 'full', 'payment.status': installments ? 'installments_active' : 'paid', 'payment.paidAt': FV.serverTimestamp() });
    }
    if (meta.accountingAddon) c['addOns.accounting'] = meta.accountingAddon;
    if (meta.courtAppearance) {
      c.courtAppearance = meta.courtAppearance;
      if (hearing) {
        c.hearings = FV.arrayUnion(hearingEntry(hearing, { appearance: meta.courtAppearance, sessionId: session.id, paymentId: session.id, amountCents: session.amount_total }));
        c.hearingDetails = legacyHearingDetails(hearing, meta.courtAppearance);
      }
    }
    await caseRef.update(c);
    await recomputeBalance(db, caseRef);
  }

  // Card fee Stripe kept on this charge (shown in the trust ledger; who bears it is Rozsa's choice, APPROVAL-7)
  if (session.payment_intent && stripe.paymentIntents) {
    try {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ['latest_charge.balance_transaction'] });
      const bt = pi.latest_charge && pi.latest_charge.balance_transaction;
      if (bt && typeof bt === 'object') await payRef.update({ stripeFeeCents: bt.fee, stripeChargeId: pi.latest_charge.id });
    } catch (e) { console.warn('card fee not read:', e.message); }
  }

  // Three-payment plan: hard stop after three charges
  let stop = null;
  if (installments && session.subscription) {
    stop = await enforceThreePayments(stripe, session.subscription, amounts.length === 3 ? amounts : [session.amount_total, session.amount_total, session.amount_total]);
    await payRef.update({ installmentStop: stop });
  }

  // Promo code usage (Firestore promoCodes)
  if (meta.promoCode) {
    try {
      const p = await db.collection('promoCodes').where('code', '==', meta.promoCode.toUpperCase()).limit(1).get();
      if (!p.empty) await p.docs[0].ref.update({ usageCount: FV.increment(1), lastUsedAt: FV.serverTimestamp() });
    } catch (e) { console.warn('promo usage not tracked:', e.message); }
  }

  return { payment, uid, caseId: caseRef ? caseRef.id : null, description: desc, customerName: userDoc ? ([userDoc.data().firstName, userDoc.data().lastName].filter(Boolean).join(' ') || userDoc.data().displayName || userDoc.data().name || null) : ((session.customer_details && session.customer_details.name) || null), stop, hearing };
}

// balanceDue = totalCharged - totalPaid + totalRefunded is NOT right for refunds of earned fees;
// we keep it simple and explicit: balanceDue = totalCharged - totalPaid (refunds do not create a balance).
async function recomputeBalance(db, caseRef) {
  const c = (await caseRef.get()).data() || {};
  const b = c.billing || {};
  await caseRef.update({ 'billing.balanceDue': Math.max(0, (b.totalCharged || 0) - (b.totalPaid || 0)), 'billing.totalRefunded': b.totalRefunded || 0 });
}

// invoice.paid: installments 2 and 3 (and receipts for every subscription charge)
async function recordInvoicePaid(stripe, db, invoiceId) {
  const inv = await stripe.invoices.retrieve(invoiceId); // re-read in the pinned API version
  // Newer Stripe API versions moved the subscription id under parent.subscription_details
  if (!inv.subscription && inv.parent && inv.parent.subscription_details) inv.subscription = inv.parent.subscription_details.subscription;
  if (!inv.subscription) return { skipped: 'not a subscription invoice' };
  const sub = await stripe.subscriptions.retrieve(inv.subscription);
  // Shared Stripe account: act only on MyProbateCA plans. New plans carry metadata.site; a legacy plan
  // (app 'probate' only) must already have its first payment recorded here. Otherwise: no write at all.
  const sm = sub.metadata || {};
  if (sm.app !== 'probate' || (sm.site !== undefined && sm.site !== 'myprobateca')) return { skipped: 'not a MyProbateCA plan' };
  if (sm.site !== 'myprobateca') {
    const known = await db.collection('payments').where('stripeSubscriptionId', '==', inv.subscription).limit(1).get();
    if (known.empty) return { skipped: 'legacy plan not recorded by MyProbateCA' };
  }
  const email = (inv.customer_email || '').toLowerCase();

  // Stripe receipt for this charge
  if (inv.charge && email) {
    try { const ch = await stripe.charges.retrieve(inv.charge); if (!ch.receipt_email) await stripe.charges.update(inv.charge, { receipt_email: email }); } catch (e) { console.warn('receipt_email not set:', e.message); }
  }

  const paidList = await stripe.invoices.list({ subscription: inv.subscription, status: 'paid', limit: 10 });
  const paidCount = paidList.data.filter(i => i.amount_paid > 0).length;
  const stop = await stopAfterThirdPayment(stripe, inv.subscription);

  if (inv.billing_reason === 'subscription_create') {
    // Payment 1 is recorded by checkout; add its charge ids so refunds can find it
    const s1 = await db.collection('payments').where('stripeSubscriptionId', '==', inv.subscription).limit(1).get();
    if (!s1.empty) await s1.docs[0].ref.update({ stripeInvoiceId: inv.id, stripeChargeId: inv.charge || null, stripePaymentIntentId: inv.payment_intent || null });
    return { first: true, linked: !s1.empty, paidCount, stop };
  }

  const ref = db.collection('payments').doc(inv.id);
  if ((await ref.get()).exists) return { duplicate: true };
  const firstSnap = await db.collection('payments').where('stripeSubscriptionId', '==', inv.subscription).limit(1).get();
  const first = firstSnap.empty ? null : firstSnap.docs[0].data();
  const done = paidCount >= 3;
  await ref.set({
    email, userId: first ? first.userId : null, caseId: first ? first.caseId : null,
    serviceType: first ? first.serviceType : (sub.metadata.serviceType || 'full'),
    probateType: first ? first.probateType : null,
    addOns: first ? first.addOns : { accounting: null },
    description: first ? first.description : 'Probate fee installment',
    paymentPlan: 'installments', amountCents: inv.amount_paid, totalPaid: inv.amount_paid,
    totalPriceCents: first ? first.totalPriceCents : null,
    installment: { number: paidCount, of: 3 }, paymentStatus: done ? 'paid' : 'installments_active', refundedCents: 0,
    stripeInvoiceId: inv.id, stripeSubscriptionId: inv.subscription, stripePaymentIntentId: inv.payment_intent || null,
    stripeChargeId: inv.charge || null, stripeCustomerId: inv.customer || null, livemode: !!inv.livemode,
    stripeFeeCents: await (async () => { try { if (!inv.charge) return null; const c = await stripe.charges.retrieve(inv.charge, { expand: ['balance_transaction'] }); return c.balance_transaction && c.balance_transaction.fee != null ? c.balance_transaction.fee : null; } catch { return null; } })(),
    createdAt: FV.serverTimestamp()
  });
  if (first && first.userId) {
    await db.collection('users').doc(first.userId).update({
      installmentsPaid: paidCount, installmentsRemaining: Math.max(0, 3 - paidCount), lastInstallmentAt: FV.serverTimestamp(),
      paymentStatus: done ? 'paid' : 'installments_active', amountPaid: FV.increment(inv.amount_paid)
    });
  }
  if (first && first.caseId) {
    const caseRef = db.collection('cases').doc(first.caseId);
    const upd = { 'billing.totalPaid': FV.increment(inv.amount_paid), lastPaymentAt: FV.serverTimestamp(), updatedAt: FV.serverTimestamp() };
    if (done) Object.assign(upd, { paymentStatus: 'paid', 'payment.status': 'paid' });
    await caseRef.update(upd);
    await recomputeBalance(db, caseRef);
  }
  return { paidCount, stop };
}

// charge.refunded (also fires for refunds made in the Stripe dashboard): keep Firestore in step.
async function recordChargeRefunded(stripe, db, chargeObj) {
  const ch = await stripe.charges.retrieve(chargeObj.id, { expand: ['refunds'] });
  let pay = null;
  for (const [field, val] of [['stripePaymentIntentId', ch.payment_intent], ['stripeChargeId', ch.id]]) {
    if (!val) continue;
    const s = await db.collection('payments').where(field, '==', val).limit(1).get();
    if (!s.empty) { pay = s.docs[0]; break; }
  }
  if (!pay && ch.invoice) {
    const inv = await stripe.invoices.retrieve(ch.invoice);
    const s2 = await db.collection('payments').where('stripeInvoiceId', '==', inv.id).limit(1).get();
    if (!s2.empty) pay = s2.docs[0];
    else if (inv.subscription && inv.billing_reason === 'subscription_create') {
      const s3 = await db.collection('payments').where('stripeSubscriptionId', '==', inv.subscription).get();
      pay = s3.docs.find(d => d.data().stripeSessionId) || null;
    }
  }
  if (!pay) return { matched: false }; // not a MyProbateCA payment (shared Stripe account)
  for (const r of (ch.refunds && ch.refunds.data) || []) {
    await db.collection('refunds').doc(r.id).set({
      stripeRefundId: r.id, amountCents: r.amount, status: r.status, reason: (r.metadata && r.metadata.reason) || r.reason || null,
      paymentId: pay.id, caseId: pay.data().caseId || null, userId: pay.data().userId || null,
      stripeChargeId: ch.id, stripePaymentIntentId: ch.payment_intent || null,
      requestedBy: (r.metadata && r.metadata.requestedBy) || 'stripe-dashboard', livemode: !!ch.livemode,
      createdAt: admin.firestore.Timestamp.fromMillis(r.created * 1000)
    }, { merge: true });
  }
  const before = pay.data().refundedCents || 0;
  const full = ch.amount_refunded >= ch.amount;
  await pay.ref.update({ refundedCents: ch.amount_refunded, refunded: full, refundStatus: full ? 'refunded' : 'partially_refunded', lastRefundAt: FV.serverTimestamp() });
  const delta = ch.amount_refunded - before;
  // Absolute recompute (the admin refund and the charge.refunded webhook can both run for one refund)
  if (pay.data().caseId) {
    const caseRef = db.collection('cases').doc(pay.data().caseId);
    const all = await db.collection('payments').where('caseId', '==', pay.data().caseId).get();
    const totalRefunded = all.docs.reduce((s2, d) => s2 + (d.id === pay.id ? ch.amount_refunded : (d.data().refundedCents || 0)), 0);
    await caseRef.update({ 'billing.totalRefunded': totalRefunded, lastRefundAt: FV.serverTimestamp() });
  }
  return { matched: true, paymentId: pay.id, refundedCents: ch.amount_refunded, delta };
}

module.exports = { recordCheckout, recordInvoicePaid, recordChargeRefunded, describe, recomputeBalance };
