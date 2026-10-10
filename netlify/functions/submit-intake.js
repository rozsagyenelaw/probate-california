// Intake submit (item 17). Signed-in client only (Firebase ID token).
// - Already paid: the answers go onto the paid case, payment status stays paid, no fee checkout.
//   Optional add-ons chosen at intake (court appearance, accounting) get a checkout for the add-on only.
// - Not paid yet: one case is opened (or the unpaid one reused) and the fee checkout starts.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { admin, getDb, corsHeaders, verifyCaller } = require('./lib/firebaseAdmin');
const { getBusinessSettings } = require('./lib/business');
const { findPaidCase, attachIntake, pickIntake } = require('./lib/intakeCase');
const { createCheckout, UserError } = require('./lib/checkout');

const str = (v, n = 200) => (typeof v === 'string' ? v.slice(0, n) : null);

exports.handler = async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const caller = await verifyCaller(event);
  if (!caller) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Please sign in again to send your answers.' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }; }
  const formData = body.formData || {};
  const sel = body.selection || {};
  const courtInfo = body.courtInfo ? { courthouse: str(body.courtInfo.name), address: str(body.courtInfo.address), phone: str(body.courtInfo.phone, 40) } : {};

  try {
    const db = getDb();
    const settings = await getBusinessSettings(db);
    const uid = caller.uid;
    const email = String(caller.email || '').toLowerCase();

    const found = await findPaidCase(db, uid, email);
    if (found) {
      const caseId = await attachIntake(db, found, uid, formData, { source: body.source || 'main-site-intake', courtInfo });
      console.log('submit-intake: attached to paid case', caseId.slice(0, 6), found.how);
      // Add-ons chosen in intake that are not already paid for
      const wantsAccounting = sel.accountingAddon && !(found.data.addOns && found.data.addOns.accounting) ? sel.accountingAddon : null;
      const wantsCourt = sel.courtAppearance || null;
      if (wantsAccounting || wantsCourt) {
        const co = await createCheckout(stripe, db, {
          serviceType: wantsCourt ? 'court_appearance' : 'accounting_addon',
          accountingAddon: wantsAccounting, courtAppearance: wantsCourt, hearing: sel.hearing,
          paymentPlan: 'full', customerEmail: email, caseId, userId: uid, source: 'intake-addon', cancelPath: '/dashboard'
        }, settings);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'attached', caseId, alreadyPaid: true, how: found.how, addOnCheckoutUrl: co.url }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'attached', caseId, alreadyPaid: true, how: found.how }) };
    }

    // Not paid: open (or reuse) one unpaid case, then the fee checkout
    const serviceType = sel.probateType === 'simplified' ? 'simplified' : 'full';
    const intake = pickIntake(formData);
    const d = intake.decedent || {};
    const county = d.lastAddress && d.lastAddress.county;
    const existing = (await db.collection('cases').where('userId', '==', uid).where('status', '==', 'pending_payment').get()).docs
      .filter(x => !x.data().archived && !['paid', 'installments_active'].includes(x.data().paymentStatus));
    const ref = existing.length ? existing[0].ref : db.collection('cases').doc();
    const caseData = {
      ...intake,
      id: ref.id,
      userId: uid,
      clientEmail: email,
      status: 'pending_payment',
      paymentStatus: 'pending',
      currentPhase: 1,
      phaseStatuses: { 1: 'in_progress', 2: 'pending', 3: 'pending', 4: 'pending', 5: 'pending', 6: 'pending', 7: 'pending', 8: 'pending', 9: 'pending', 10: 'pending', 11: 'pending' },
      estateName: `Estate of ${[d.firstName, d.lastName].filter(Boolean).join(' ')}`,
      filingCounty: county || null,
      probateType: intake.willExists ? 'testate' : 'intestate',
      serviceType,
      addOns: { accounting: sel.accountingAddon || null },
      court: { county: county || null, courthouse: courtInfo.courthouse || null, address: courtInfo.address || null, phone: courtInfo.phone || null, caseNumber: null },
      payment: { plan: sel.paymentPlan === 'installments' ? 'installments' : 'full', status: 'pending', paidAt: null },
      intakeCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
      intakeSource: body.source || 'main-site-intake',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    if (!existing.length) caseData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    await ref.set(caseData, { merge: true });
    await db.collection('users').doc(uid).set({ currentCaseId: ref.id, paymentPlan: caseData.payment.plan, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

    const co = await createCheckout(stripe, db, {
      serviceType, probateType: serviceType, accountingAddon: sel.accountingAddon || null,
      courtAppearance: sel.courtAppearance || null, hearing: sel.hearing,
      paymentPlan: sel.paymentPlan === 'installments' ? 'installments' : 'full',
      customerEmail: email, caseId: ref.id, userId: uid, promoCode: sel.promoCode || null, source: 'intake', cancelPath: '/intake?canceled=true'
    }, settings);
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'checkout', caseId: ref.id, url: co.url }) };
  } catch (err) {
    console.error('submit-intake error:', err.message);
    if (err.userFacing) return { statusCode: err.status || 400, headers, body: JSON.stringify({ error: err.message }) };
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'We could not send your answers. Please try again or call 818-337-4071.' }) };
  }
};
