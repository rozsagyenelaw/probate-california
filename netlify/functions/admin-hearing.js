// Continued hearing (Rozsa, decisions section 22): the paid $500 appearance moves to the new date, no new charge.
// Admin only. POST { action: 'continue', caseId, hearingId, date: 'YYYY-MM-DD', time?, department?, note? }
// Writes cases/{id}.hearings (W3-cockpit's calendar reads it), keeps legacy hearingDetails in step, audit logged.
const { admin, getDb, corsHeaders, verifyCaller, isAdminToken } = require('./lib/firebaseAdmin');
const { continueHearing } = require('./lib/hearings');
const { decideAppearance } = require('./lib/appearanceDecision');

let stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = corsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  const caller = await verifyCaller(event);
  if (!isAdminToken(caller)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin only' }) };
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }; }
  // Short notice appearance (Rozsa, 2026-10-12): POST { action: 'appearance-confirm' | 'appearance-decline', caseId, hearingId }.
  // "Cannot appear" refunds the payment in full automatically, once (lib/appearanceDecision.js).
  if (body.action === 'appearance-confirm' || body.action === 'appearance-decline') {
    try {
      const out = await decideAppearance(getDb(), stripe, { caseId: String(body.caseId || ''), hearingId: String(body.hearingId || ''), decision: body.action === 'appearance-confirm' ? 'confirm' : 'decline', actorEmail: caller.email });
      return { statusCode: 200, headers, body: JSON.stringify(out) };
    } catch (err) {
      console.error('admin-hearing appearance:', err.message);
      return { statusCode: err.status || 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }
  if (body.action !== 'continue') return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
  try {
    const db = getDb();
    const ref = db.collection('cases').doc(String(body.caseId || ''));
    const out = await db.runTransaction(async (tx) => {
      const c = await tx.get(ref);
      if (!c.exists) throw Object.assign(new Error('Case not found'), { status: 404 });
      // F38: the cockpit may show the checkout hearing from the legacy hearingDetails field. Continue the matching
      // hearings[] entry (same date, from checkout), or build one from hearingDetails with its paid appearance, so the
      // client and the admin see one hearing with the new date and the $500 carries over.
      let list = Array.isArray(c.data().hearings) ? c.data().hearings : [];
      let hearingId = body.hearingId;
      const hd = c.data().hearingDetails;
      if (!list.some(h => h.id === hearingId) && hd && hd.hearingDate) {
        const match = list.find(h => h.date === hd.hearingDate && h.outcome !== 'continued');
        if (match) hearingId = match.id;
        else {
          const legacyId = 'legacy-' + String(hd.hearingDate);
          list = [...list, { id: legacyId, type: 'other', date: hd.hearingDate, time: hd.hearingTime || '', department: hd.department || '', courthouse: hd.county ? `${hd.county} County Superior Court` : '', notes: hd.hearingType || '', outcome: '', source: 'checkout',
            appearanceRequested: !!(hd.courtAppearance || c.data().courtAppearance), appearance: (hd.courtAppearance || c.data().courtAppearance) ? { kind: hd.courtAppearance || c.data().courtAppearance, paid: true, amountCents: null, paymentId: null } : null, createdAt: admin.firestore.Timestamp.now() }];
          hearingId = legacyId;
        }
      }
      const { hearings, newId } = continueHearing(list, hearingId, { date: body.date, time: body.time, department: body.department, note: body.note });
      const moved = hearings.find(h => h.id === newId);
      tx.update(ref, { hearings, 'hearingDetails.hearingDate': moved.date, 'hearingDetails.hearingTime': moved.time || '', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return { newId, moved };
    });
    await db.collection('auditLog').add({ at: admin.firestore.FieldValue.serverTimestamp(), actorType: 'admin', actorUid: caller.uid, actorEmail: caller.email, action: 'hearing.continue', caseId: ref.id, target: `cases/${ref.id}`, meta: { from: body.hearingId, to: out.newId, date: body.date, appearanceCarriedOver: !!(out.moved.appearance && out.moved.appearance.paid) } });
    return { statusCode: 200, headers, body: JSON.stringify({ continued: true, newHearingId: out.newId, hearing: { date: out.moved.date, time: out.moved.time, department: out.moved.department, appearance: out.moved.appearance } }) };
  } catch (err) {
    return { statusCode: err.status || 400, headers, body: JSON.stringify({ error: err.message }) };
  }
};

// Tests only: a stub Stripe client (no network)
exports._setStripeForTests = (stub) => { stripe = stub; };
