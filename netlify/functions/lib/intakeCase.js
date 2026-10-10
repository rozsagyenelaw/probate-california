// Item 17: a client who already paid is never asked to pay again.
// Server-side, shared by submit-intake.js today and the portal intake (W3-home) later.
//
// findPaidCase(): the client's case that was created or marked paid by the Stripe webhook
//   (status 'intake_pending', paymentStatus 'paid' or 'installments_active').
// attachIntake(): writes the intake answers onto that case, keeps every payment field as is.
const { admin } = require('./firebaseAdmin');

const PAID = ['paid', 'installments_active'];
const ts = (v) => (v && v.toMillis ? v.toMillis() : 0);

// Whitelisted intake answers (the client can never send payment, phase or status fields through here).
const INTAKE_FIELDS = ['decedent', 'petitioner', 'willExists', 'willDate', 'codicilExists', 'codicilDates', 'namedExecutor', 'bondWaivedInWill', 'heirs', 'assets', 'liabilities', 'documents'];

function pickIntake(formData) {
  const out = {};
  for (const k of INTAKE_FIELDS) if (formData && formData[k] !== undefined) out[k] = formData[k];
  // documents: only the file metadata the intake upload step stores
  if (out.documents && typeof out.documents === 'object') {
    const docs = {};
    for (const [k, v] of Object.entries(out.documents)) {
      if (v && typeof v === 'object') docs[k] = { uploaded: !!v.uploaded, fileName: v.fileName || null, fileSize: v.fileSize || null, fileType: v.fileType || null, storagePath: v.storagePath || null, downloadURL: v.downloadURL || null };
    }
    out.documents = docs;
  }
  return JSON.parse(JSON.stringify(out)); // drop undefined values
}

function isPaidCase(c) {
  return PAID.includes(c.paymentStatus) || (c.payment && c.payment.status === 'paid');
}

// Returns { ref, data, how } or null.
async function findPaidCase(db, uid, email) {
  const snap = await db.collection('cases').where('userId', '==', uid).get();
  const cases = snap.docs.map(d => ({ ref: d.ref, data: d.data() })).filter(c => !c.data.archived);
  const paid = cases.filter(c => isPaidCase(c.data));
  // Prefer the paid case still waiting for intake, then the newest paid case
  const waiting = paid.filter(c => !c.data.intakeCompletedAt).sort((a, b) => ts(b.data.createdAt) - ts(a.data.createdAt));
  if (waiting.length) return { ...waiting[0], how: 'paid-case-waiting-for-intake' };
  if (paid.length) return { ...paid.sort((a, b) => ts(b.data.createdAt) - ts(a.data.createdAt))[0], how: 'paid-case' };

  // Paid, but the webhook could not open a case (paid as a guest before the account existed):
  // find their probate payment by account or email that is not tied to a case yet.
  const lower = String(email || '').toLowerCase();
  const pays = [];
  for (const q of [db.collection('payments').where('userId', '==', uid), lower ? db.collection('payments').where('email', '==', lower) : null]) {
    if (!q) continue;
    const s = await q.get();
    s.docs.forEach(d => { if (!pays.find(p => p.id === d.id)) pays.push({ id: d.id, ref: d.ref, data: d.data() }); });
  }
  const usable = pays.filter(p => PAID.includes(p.data.paymentStatus) && !p.data.caseId && !p.data.refunded && ['simplified', 'full'].includes(p.data.serviceType) && String(p.data.stripeSessionId || '').startsWith('cs_'))
    .sort((a, b) => ts(b.data.createdAt) - ts(a.data.createdAt));
  if (!usable.length) return null;
  const p = usable[0];
  const ref = db.collection('cases').doc();
  const data = {
    userId: uid,
    clientEmail: lower,
    status: 'intake_pending',
    paymentStatus: p.data.paymentStatus,
    serviceType: p.data.serviceType,
    probateType: p.data.probateType || null,
    addOns: p.data.addOns || { accounting: null },
    orderNumber: p.data.orderNumber || null,
    source: 'payment',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    paidAt: p.data.createdAt || admin.firestore.FieldValue.serverTimestamp()
  };
  await ref.set(data);
  await p.ref.update({ caseId: ref.id, userId: uid });
  return { ref, data, how: 'case-opened-from-payment' };
}

// Writes intake answers onto the paid case. Never touches paymentStatus, payment amounts or serviceType.
async function attachIntake(db, found, uid, formData, extras = {}) {
  const intake = pickIntake(formData);
  const d = intake.decedent || {};
  const county = d.lastAddress && d.lastAddress.county;
  const update = {
    ...intake,
    estateName: d.firstName || d.lastName ? `Estate of ${[d.firstName, d.lastName].filter(Boolean).join(' ')}` : (found.data.estateName || null),
    filingCounty: county || found.data.filingCounty || null,
    status: 'active',
    currentPhase: found.data.currentPhase || 1,
    phaseStatuses: found.data.phaseStatuses || { 1: 'in_progress', 2: 'pending', 3: 'pending', 4: 'pending', 5: 'pending', 6: 'pending', 7: 'pending', 8: 'pending', 9: 'pending', 10: 'pending', 11: 'pending' },
    intakeCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
    intakeSource: extras.source || 'main-site-intake',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    'payment.status': 'paid' // mirror for the legacy admin case page; paymentStatus itself is untouched
  };
  if (county && !(found.data.court && found.data.court.county)) update.court = { ...(found.data.court || {}), county, ...(extras.courtInfo || {}) };
  // The legacy payment.status mirror only applies to fully paid cases
  if (found.data.paymentStatus === 'installments_active') delete update['payment.status'];
  // cases.probateType means "with or without a will" (what the admin case page reads). The package
  // the client paid for stays in serviceType, which this never changes.
  if (intake.willExists === true || intake.willExists === false) update.probateType = intake.willExists ? 'testate' : 'intestate';
  await found.ref.update(update);
  await db.collection('users').doc(uid).set({ currentCaseId: found.ref.id, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  return found.ref.id;
}

module.exports = { findPaidCase, attachIntake, pickIntake, isPaidCase, PAID };
