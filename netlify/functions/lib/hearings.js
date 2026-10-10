// Turns hearing details a client typed (intake add-on or standalone court appearance) into one
// cases/{id}.hearings[] entry in the shape W3-cockpit's calendar reads (notes/shared-data-model.md, section 5).
const { admin } = require('./firebaseAdmin');

function mapType(raw) {
  const s = String(raw || '').toLowerCase();
  if (s.includes('petition for probate') || s === 'petition_hearing') return 'petition';
  if (s.includes('final')) return 'final';
  if (s.includes('status')) return 'status';
  return 'other';
}

function unpackHearing(json) {
  if (!json) return null;
  try { const o = JSON.parse(json); return o && o.d ? o : null; } catch { return null; }
}

// h: unpacked metadata ({d,t,dept,cn,co,ty,x}); appearance: 'remote' | 'contested'
function hearingEntry(h, { appearance, sessionId, paymentId, amountCents, source = 'checkout' }) {
  const typeLabel = h.ty === 'other' || h.ty === 'Other' ? (h.x || 'Other') : h.ty;
  return {
    id: `chk_${String(sessionId || Date.now()).slice(-12)}`,
    type: mapType(h.ty),
    date: h.d || '',
    time: h.t || '',
    department: h.dept || '',
    courthouse: h.co ? `${h.co} County Superior Court` : '',
    notes: [typeLabel, h.cn ? `Case number given by client: ${h.cn}` : '', h.x && typeLabel !== h.x ? h.x : ''].filter(Boolean).join('. '),
    outcome: '',
    source,
    appearanceRequested: true,
    appearance: { kind: appearance, paid: true, amountCents: amountCents || null, stripeSessionId: sessionId || null, paymentId: paymentId || null },
    clientCaseNumber: h.cn || '',
    county: h.co || '',
    createdAt: admin.firestore.Timestamp.now()
  };
}

// Legacy field the old /admin/hearings page reads, kept in step so nothing disappears there.
function legacyHearingDetails(h, appearance) {
  return { caseNumber: h.cn || '', county: h.co || '', hearingDate: h.d || '', hearingTime: h.t || '', department: h.dept || '', hearingType: h.ty || '', otherDescription: h.x || '', courtAppearance: appearance };
}

module.exports = { hearingEntry, unpackHearing, legacyHearingDetails, mapType };
