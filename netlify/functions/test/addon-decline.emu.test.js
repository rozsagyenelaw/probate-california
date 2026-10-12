// Item L (eighth message, approved): "Decline and refund" an add-on paid with no paid probate package. One refund, ever.
// Stripe is a local stand-in here; the Stripe TEST mode proof is in build-evidence/prep-L (real test charges and refunds).
// firebase emulators:exec --only firestore "GCLOUD_PROJECT=demo-iteml node --test netlify/functions/test/addon-decline.emu.test.js"
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const emu = !!process.env.FIRESTORE_EMULATOR_HOST && /^demo-/.test(process.env.GCLOUD_PROJECT || '');
if (!emu) { test('needs the Firestore emulator', { skip: true }, () => {}); return; }
const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: process.env.GCLOUD_PROJECT, client_email: 'fake@demo.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
const { getDb } = require('../lib/firebaseAdmin');
const { declineAddon } = require('../lib/addonDecline');
const db = getDb();

function fakeStripe() {
  const charges = {}; const made = []; const keys = {};
  return { made,
    addCharge(id, pi, amount) { charges[id] = { id, payment_intent: pi, amount, amount_refunded: 0, livemode: false }; },
    paymentIntents: { retrieve: async (pi) => ({ id: pi, latest_charge: Object.values(charges).find((c) => c.payment_intent === pi).id }) },
    charges: { retrieve: async (id) => ({ ...charges[id], refunds: { data: made.filter((r) => r.charge === id) } }) },
    refunds: {
      list: async ({ charge }) => ({ data: made.filter((r) => r.charge === charge) }),
      create: async (params, opts) => {
        if (opts && keys[opts.idempotencyKey]) return keys[opts.idempotencyKey];
        const c = charges[params.charge]; const r = { id: `re_test_${made.length + 1}`, charge: params.charge, amount: params.amount, status: 'succeeded', metadata: params.metadata || {}, created: Math.floor(Date.now() / 1000) };
        made.push(r); c.amount_refunded += params.amount; keys[opts.idempotencyKey] = r; return r;
      }
    } };
}

test('an appearance with no package: declined once, one refund, the hearing loses the appearance, one email', async () => {
  const s = fakeStripe(); const id = 'L-' + Date.now();
  s.addCharge('ch_' + id, 'pi_' + id, 50000);
  await db.collection('payments').doc('pay_' + id).set({ caseId: 'case_' + id, email: 'rozsagyenelaw1+l@gmail.com', serviceType: 'court_appearance', stripePaymentIntentId: 'pi_' + id, createdAt: new Date() });
  await db.collection('cases').doc('case_' + id).set({ userId: 'u_' + id, clientEmail: 'rozsagyenelaw1+l@gmail.com', paymentStatus: 'pending', hearings: [{ id: 'h1', date: '2026-10-20', outcome: '', appearanceRequested: true, appearance: { kind: 'remote', paid: true, paymentId: 'pay_' + id } }] });
  const [a, b] = await Promise.all([1, 2].map(() => declineAddon(db, s, { caseId: 'case_' + id, paymentId: 'pay_' + id, actorEmail: 'office@example.com' })));
  const c = await declineAddon(db, s, { caseId: 'case_' + id, paymentId: 'pay_' + id, actorEmail: 'office@example.com' });
  assert.strictEqual(s.made.length, 1); assert.strictEqual(s.made[0].amount, 50000);
  assert.ok([a, b].filter((x) => !x.already).length === 1); assert.strictEqual(c.already, true);
  const h = (await db.collection('cases').doc('case_' + id).get()).data().hearings[0];
  assert.strictEqual(h.appearanceRequested, false); assert.strictEqual(h.appearance.refund.status, 'refunded');
  const m = (await db.collection('mailOutbox').doc('addon-declined-pay_' + id).get()).data();
  assert.strictEqual(m.template, 'addonDeclined'); assert.strictEqual(m.data.kind, 'appearance'); assert.strictEqual(m.data.hearingDate, '2026-10-20');
  assert.strictEqual((await db.collection('auditLog').where('caseId', '==', 'case_' + id).get()).docs.filter((d) => d.data().action === 'addon.decline').length, 1);
});

test('refused when the case has a paid probate package, or the payment belongs to another case', async () => {
  const s = fakeStripe(); const id = 'L2-' + Date.now();
  await db.collection('payments').doc('pay_' + id).set({ caseId: 'case_' + id, serviceType: 'accounting_addon', createdAt: new Date() });
  await db.collection('cases').doc('case_' + id).set({ paymentStatus: 'paid', serviceType: 'full' });
  await assert.rejects(declineAddon(db, s, { caseId: 'case_' + id, paymentId: 'pay_' + id }), /paid probate package/);
  await assert.rejects(declineAddon(db, s, { caseId: 'other_' + id, paymentId: 'pay_' + id }), /Case not found|another case/);
  assert.strictEqual(s.made.length, 0);
});
