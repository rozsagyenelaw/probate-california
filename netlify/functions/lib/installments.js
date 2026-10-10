// Three-payment plan: hard stop after exactly three charges.
// Stripe Checkout starts a monthly subscription (charge 1). Right after checkout the webhook
// turns it into a Subscription Schedule: 3 billing periods in total, then end_behavior 'cancel',
// so Stripe itself never creates a 4th invoice. Two backstops:
//  - if the schedule cannot be made, the subscription gets cancel_at in the middle of period 3;
//  - every paid invoice is counted, and after the 3rd paid one the subscription is cancelled.

function addMonthsUTC(unixSeconds, months) {
  const d = new Date(unixSeconds * 1000);
  d.setUTCMonth(d.getUTCMonth() + months);
  return Math.floor(d.getTime() / 1000);
}

function periodStart(sub) {
  // API versions differ: the period lives on the subscription or on its first item.
  return sub.current_period_start || (sub.items && sub.items.data[0] && sub.items.data[0].current_period_start) || sub.start_date;
}

async function enforceThreePayments(stripe, subscriptionId, amounts) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const item = sub.items.data[0];
  const price = item.price;
  if (sub.schedule) {
    const existing = await stripe.subscriptionSchedules.retrieve(typeof sub.schedule === 'string' ? sub.schedule : sub.schedule.id);
    if (existing.end_behavior === 'cancel' && existing.metadata && existing.metadata.hardStop === '3') return { mode: 'schedule', scheduleId: existing.id, already: true };
  }
  try {
    const sched = sub.schedule
      ? await stripe.subscriptionSchedules.retrieve(typeof sub.schedule === 'string' ? sub.schedule : sub.schedule.id)
      : await stripe.subscriptionSchedules.create({ from_subscription: subscriptionId });
    const start = sched.phases[0].start_date;
    const equal = amounts.every(a => a === amounts[0]) && amounts[0] === price.unit_amount;
    const phases = equal
      ? [{ items: [{ price: price.id, quantity: 1 }], start_date: start, iterations: 3, proration_behavior: 'none' }]
      : [
          { items: [{ price: price.id, quantity: 1 }], start_date: start, iterations: 2, proration_behavior: 'none' },
          { items: [{ price_data: { currency: price.currency, product: price.product, unit_amount: amounts[2], recurring: { interval: 'month', interval_count: 1 } }, quantity: 1 }], iterations: 1, proration_behavior: 'none' }
        ];
    const updated = await stripe.subscriptionSchedules.update(sched.id, {
      end_behavior: 'cancel',
      phases,
      metadata: { app: 'probate', hardStop: '3', amounts: amounts.join(',') }
    });
    return { mode: 'schedule', scheduleId: updated.id, phases: updated.phases.map(p => ({ start: p.start_date, end: p.end_date })) };
  } catch (err) {
    console.error('Subscription schedule failed, setting cancel_at backstop:', err.message);
    const cancelAt = addMonthsUTC(periodStart(sub), 2) + 15 * 86400; // middle of the 3rd period: no 4th invoice
    await stripe.subscriptions.update(subscriptionId, { cancel_at: cancelAt, proration_behavior: 'none' });
    return { mode: 'cancel_at', cancelAt, error: err.message };
  }
}

// Backstop on every paid invoice: after three paid charges, stop the subscription.
async function stopAfterThirdPayment(stripe, subscriptionId) {
  const inv = await stripe.invoices.list({ subscription: subscriptionId, status: 'paid', limit: 10 });
  const paid = inv.data.filter(i => i.amount_paid > 0).length;
  if (paid < 3) return { paid, cancelled: false };
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  if (sub.status === 'canceled') return { paid, cancelled: false, already: true };
  // No proration and no final invoice: the three charges are the whole price.
  await stripe.subscriptions.cancel(subscriptionId, { prorate: false, invoice_now: false });
  return { paid, cancelled: true, via: 'subscription' };
}

module.exports = { enforceThreePayments, stopAfterThirdPayment, addMonthsUTC };
