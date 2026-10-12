// Item m (Rozsa, 2026-10-12 point 4): short notice court appearance. "Cannot appear" refunds the payment in full,
// automatically and never twice. Stripe is a local stand-in (no network, no live or test refunds).
// FIRESTORE_EMULATOR_HOST=127.0.0.1:8540 GCLOUD_PROJECT=demo-itemm node --test netlify/functions/test/appearance-short-notice.emu.test.js
const test = require('node:test');
const assert = require('node:assert');

process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_fake';
const { createCheckout } = require('../lib/checkout');

// Stripe stand-in: one $500 charge per payment intent; refunds honour idempotency keys the way Stripe does
function fakeStripe() {
  const charges = {}; const made = []; const keys = {}; const calls = { create: 0 };
  const api = {
    calls, made,
    addCharge(id, pi, amount) { charges[id] = { id, payment_intent: pi, amount, amount_refunded: 0, livemode: false, refunds: { data: [] } }; },
    paymentIntents: { retrieve: async (pi) => ({ id: pi, latest_charge: Object.values(charges).find((c) => c.payment_intent === pi).id }) },
    checkout: { sessions: { retrieve: async (id) => ({ id, payment_intent: `pi_${id}` }), create: async (cfg) => { calls.session = cfg; return { id: 'cs_test_m', url: 'https://checkout.stripe.com/c/pay/cs_test_m' }; } } },
    promotionCodes: { list: async () => ({ data: [] }) },
    charges: { retrieve: async (id) => { const c = charges[id]; return { ...c, refunds: { data: made.filter((r) => r.charge === id) } }; } },
    refunds: {
      list: async ({ charge }) => ({ data: made.filter((r) => r.charge === charge) }),
      create: async (params, opts) => {
        calls.create += 1;
        if (opts && opts.idempotencyKey && keys[opts.idempotencyKey]) return keys[opts.idempotencyKey];
        const c = charges[params.charge];
        if (params.amount > c.amount - c.amount_refunded) throw new Error('Refund exceeds charge');
        const r = { id: `re_test_${made.length + 1}`, charge: params.charge, amount: params.amount, status: 'succeeded', metadata: params.metadata || {}, created: Math.floor(Date.now() / 1000) };
        made.push(r); c.amount_refunded += params.amount;
        if (opts && opts.idempotencyKey) keys[opts.idempotencyKey] = r;
        return r;
      }
    }
  };
  return api;
}

const MONDAY_10AM = new Date('2026-10-12T17:00:00Z');

test('checkout refuses a hearing less than 2 court days away and marks short notice under 7 days', async () => {
  const s = fakeStripe();
  await assert.rejects(createCheckout(s, null, { serviceType: 'court_appearance', courtAppearance: 'remote', hearing: { hearingDate: '2026-10-13' }, now: MONDAY_10AM, paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+m@gmail.com' }, {}), (e) => e.userFacing && /earliest date we can take online is Wednesday, October 14, 2026/.test(e.message) && e.code === 'hearing_too_soon');
  await assert.rejects(createCheckout(s, null, { serviceType: 'court_appearance', courtAppearance: 'remote', hearing: { hearingDate: '2026-10-17' }, now: MONDAY_10AM, paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+m@gmail.com' }, {}), (e) => e.code === 'hearing_not_court_day');
  await createCheckout(s, null, { serviceType: 'court_appearance', courtAppearance: 'remote', hearing: { hearingDate: '2026-10-16' }, now: MONDAY_10AM, paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+m@gmail.com' }, {});
  assert.strictEqual(s.calls.session.metadata.shortNotice, '1');
  await createCheckout(s, null, { serviceType: 'court_appearance', courtAppearance: 'remote', hearing: { hearingDate: '2026-10-19' }, now: MONDAY_10AM, paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+m@gmail.com' }, {});
  assert.strictEqual(s.calls.session.metadata.shortNotice, '');
});

test('the 11:30 pm Pacific boundary: the date is counted in Pacific time, not UTC', async () => {
  const s = fakeStripe();
  const lateMonday = new Date('2026-10-13T06:30:00Z'); // Monday 11:30 pm Pacific, Tuesday in UTC
  await createCheckout(s, null, { serviceType: 'court_appearance', courtAppearance: 'remote', hearing: { hearingDate: '2026-10-14' }, now: lateMonday, paymentPlan: 'full', customerEmail: 'rozsagyenelaw1+m@gmail.com' }, {});
  assert.strictEqual(s.calls.session.metadata.shortNotice, '1');
});

const emu = !!process.env.FIRESTORE_EMULATOR_HOST && /^demo-/.test(process.env.GCLOUD_PROJECT || '');
if (emu) {
  const { privateKey } = require('crypto').generateKeyPairSync('rsa', { modulusLength: 2048 });
  process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: process.env.GCLOUD_PROJECT, client_email: 'fake@demo.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
}

test('short notice payment, then "cannot appear": one full refund, recorded, never twice', { skip: !emu && 'needs the Firestore emulator' }, async () => {
  const { getDb } = require('../lib/firebaseAdmin');
  const { recordCheckout } = require('../lib/recordPayment');
  const { decideAppearance } = require('../lib/appearanceDecision');
  const db = getDb();
  const s = fakeStripe();
  const uid = 'itemm-' + Date.now(); const email = `rozsagyenelaw1+${uid}@gmail.com`;
  await db.collection('users').doc(uid).set({ email, firstName: 'Dana' });
  const c = await db.collection('cases').add({ userId: uid, clientEmail: email, status: 'active', paymentStatus: 'paid', serviceType: 'full', createdAt: new Date(),
    hearings: [{ id: 'office1', type: 'petition', date: '2026-10-16', time: '08:30', department: '11', source: 'admin', appearanceRequested: false, outcome: '' }] });
  const sessionId = 'cs_test_m_' + uid;
  s.addCharge('ch_' + uid, `pi_${sessionId}`, 50000);
  await recordCheckout(s, db, { id: sessionId, payment_intent: `pi_${sessionId}`, payment_status: 'paid', amount_total: 50000, customer_email: email, livemode: false,
    metadata: { app: 'probate', serviceType: 'court_appearance', courtAppearance: 'remote', paymentPlan: 'full', caseId: c.id, userId: uid, hearingId: 'office1', shortNotice: '1',
      hearing: JSON.stringify({ d: '2026-10-16', t: '08:30', dept: '11', cn: '', co: 'Los Angeles', ty: 'petition', x: '' }) } });
  let h = (await c.get()).data().hearings[0];
  assert.strictEqual(h.appearance.shortNotice, true);
  assert.strictEqual(h.appearance.confirmation, 'pending');
  await db.collection('payments').doc(sessionId).update({ stripePaymentIntentId: `pi_${sessionId}` });

  // Two "cannot appear" clicks at the same moment, then a third later
  const [r1, r2] = await Promise.all([
    decideAppearance(db, s, { caseId: c.id, hearingId: 'office1', decision: 'decline', actorEmail: 'office@example.com' }),
    decideAppearance(db, s, { caseId: c.id, hearingId: 'office1', decision: 'decline', actorEmail: 'office@example.com' }).catch((e) => ({ error: e.message }))
  ]);
  const r3 = await decideAppearance(db, s, { caseId: c.id, hearingId: 'office1', decision: 'decline', actorEmail: 'office@example.com' });
  assert.strictEqual(s.made.length, 1, 'exactly one Stripe refund');
  assert.strictEqual(s.made[0].amount, 50000, 'full refund');
  assert.strictEqual(s.made[0].metadata.appearanceKey, `appearance-decline-${c.id}-office1`);
  assert.strictEqual(r3.already, true);
  assert.ok([r1, r2].some((r) => r && r.status === 'declined'));
  h = (await c.get()).data().hearings[0];
  assert.strictEqual(h.appearance.confirmation, 'declined');
  assert.strictEqual(h.appearance.refund.status, 'refunded');
  assert.strictEqual(h.appearance.refund.id, 're_test_1');
  assert.strictEqual(h.appearance.refund.amountCents, 50000);
  assert.strictEqual(h.appearanceRequested, false);
  const pay = (await db.collection('payments').doc(sessionId).get()).data();
  assert.strictEqual(pay.refundedCents, 50000);
  assert.strictEqual((await db.collection('refunds').doc('re_test_1').get()).data().createdVia, 'appearance-decline');
  const mail = await db.collection('mailOutbox').doc(`appearance-declined-${c.id}-office1`).get();
  assert.strictEqual(mail.data().template, 'appearanceDeclined');
  assert.strictEqual(mail.data().data.refundCents, 50000);
  // Confirming after a decline changes nothing
  const r4 = await decideAppearance(db, s, { caseId: c.id, hearingId: 'office1', decision: 'confirm', actorEmail: 'office@example.com' });
  assert.strictEqual(r4.status, 'declined');
  assert.strictEqual(s.made.length, 1);
});

test('a refund made at Stripe but not yet recorded (timeout) is found and reused, not repeated', { skip: !emu && 'needs the Firestore emulator' }, async () => {
  const { getDb } = require('../lib/firebaseAdmin');
  const { decideAppearance } = require('../lib/appearanceDecision');
  const db = getDb();
  const s = fakeStripe();
  const uid = 'itemm2-' + Date.now(); const sessionId = 'cs_test_m2_' + uid; const pi = `pi_${sessionId}`;
  s.addCharge('ch_' + uid, pi, 50000);
  await db.collection('payments').doc(sessionId).set({ stripeSessionId: sessionId, stripePaymentIntentId: pi, userId: uid, amountCents: 50000 });
  const c = await db.collection('cases').add({ userId: uid, clientEmail: `rozsagyenelaw1+${uid}@gmail.com`, status: 'active',
    hearings: [{ id: 'h1', type: 'petition', date: '2026-10-16', outcome: '', appearanceRequested: false,
      appearance: { kind: 'remote', paid: true, paymentId: sessionId, shortNotice: true, confirmation: 'declined', refund: { status: 'pending', key: 'set-below' } } }] });
  // fix the key to this case (as step 1 would have written it), and make the Stripe refund already exist
  const key = `appearance-decline-${c.id}-h1`;
  const list = (await c.get()).data().hearings; list[0].appearance.refund.key = key; await c.update({ hearings: list });
  await s.refunds.create({ charge: 'ch_' + uid, amount: 50000, metadata: { appearanceKey: key } }, { idempotencyKey: 'some-older-call' });
  const out = await decideAppearance(db, s, { caseId: c.id, hearingId: 'h1', decision: 'decline', actorEmail: 'office@example.com' });
  assert.strictEqual(s.made.length, 1, 'no second refund');
  assert.strictEqual(out.refund.id, 're_test_1');
  assert.strictEqual((await c.get()).data().hearings[0].appearance.refund.status, 'refunded');
});

test('confirm: pending becomes confirmed and the client is told once', { skip: !emu && 'needs the Firestore emulator' }, async () => {
  const { getDb } = require('../lib/firebaseAdmin');
  const { decideAppearance } = require('../lib/appearanceDecision');
  const db = getDb();
  const uid = 'itemm3-' + Date.now();
  const c = await db.collection('cases').add({ userId: uid, clientEmail: `rozsagyenelaw1+${uid}@gmail.com`, status: 'active',
    hearings: [{ id: 'h1', type: 'petition', date: '2026-10-16', time: '08:30', outcome: '', appearanceRequested: true, appearance: { kind: 'remote', paid: false, includedUnder10810: true, paymentId: null, shortNotice: true, confirmation: 'pending' } }] });
  const a = await decideAppearance(db, fakeStripe(), { caseId: c.id, hearingId: 'h1', decision: 'confirm', actorEmail: 'office@example.com' });
  const b = await decideAppearance(db, fakeStripe(), { caseId: c.id, hearingId: 'h1', decision: 'confirm', actorEmail: 'office@example.com' });
  assert.strictEqual(a.status, 'confirmed'); assert.strictEqual(b.already, true);
  assert.strictEqual((await c.get()).data().hearings[0].appearance.confirmation, 'confirmed');
  assert.strictEqual((await db.collection('mailOutbox').doc(`appearance-confirmed-${c.id}-h1`).get()).data().template, 'appearanceConfirmed');
});
