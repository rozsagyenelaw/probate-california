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
// extra: more appearance fields, e.g. { shortNotice: true, confirmation: 'pending' } (Rozsa, 2026-10-12)
function hearingEntry(h, { appearance, sessionId, paymentId, amountCents, source = 'checkout', extra = {} }) {
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
    appearance: { kind: appearance, paid: true, amountCents: amountCents || null, stripeSessionId: sessionId || null, paymentId: paymentId || null, ...extra },
    clientCaseNumber: h.cn || '',
    county: h.co || '',
    createdAt: admin.firestore.Timestamp.now()
  };
}

// Legacy field the old /admin/hearings page reads, kept in step so nothing disappears there.
function legacyHearingDetails(h, appearance) {
  return { caseNumber: h.cn || '', county: h.co || '', hearingDate: h.d || '', hearingTime: h.t || '', department: h.dept || '', hearingType: h.ty || '', otherDescription: h.x || '', courtAppearance: appearance };
}

// A continued hearing (Rozsa, decisions section 22): the paid $500 appearance carries over to the new date with no new
// charge. Returns the new hearings array: the old entry gets outcome 'continued' and continuedTo; a new entry has the
// new date and the same appearance (carriedFrom = old id, same payment).
function continueHearing(hearings, hearingId, { date, time, department, note }, now) {
  const list = Array.isArray(hearings) ? hearings.map(h => ({ ...h })) : [];
  const i = list.findIndex(h => h.id === hearingId);
  if (i < 0) throw new Error('Hearing not found');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) throw new Error('New date must be YYYY-MM-DD');
  const old = list[i];
  const newId = `${old.id}-c${list.filter(h => String(h.id).startsWith(old.id + '-c')).length + 1}`;
  // W6 F38: the same hearing can be on file twice (the office's entry and the checkout entry with the paid appearance).
  // Every live entry on that date moves with it; a paid appearance on any of them carries over to the new date.
  const live = (h) => h && !['continued', 'off-calendar', 'vacated', 'cancelled'].includes(h.outcome) && !h.archived;
  const twins = list.map((h, j) => (j !== i && live(h) && h.date === old.date ? j : -1)).filter(j => j >= 0);
  const paidFrom = [old, ...twins.map(j => list[j])].find(h => h.appearance && (h.appearance.paid || h.appearance.includedUnder10810));
  list[i] = { ...old, outcome: 'continued', continuedTo: newId };
  for (const j of twins) list[j] = { ...list[j], outcome: 'continued', continuedTo: newId };
  list.push({
    ...old, id: newId, date, time: time || old.time || '', department: department || old.department || '', outcome: '', continuedTo: null,
    notes: [old.notes, `Continued from ${old.date}${note ? ': ' + note : ''}`].filter(Boolean).join('. '),
    source: 'continued', carriedFrom: old.id,
    appearanceRequested: !!(paidFrom || old.appearanceRequested),
    appearance: paidFrom ? { ...paidFrom.appearance, carriedFromHearingId: paidFrom.id, newChargeCents: 0 } : null,
    createdAt: now || admin.firestore.Timestamp.now()
  });
  return { hearings: list, newId };
}

// W6 F38: a client who buys the appearance for a hearing the office already entered (picked in the client home by its
// id) gets the appearance on THAT entry, so there is one hearing per date and a continuance carries the appearance.
// Returns the new array, or null when no live entry has that id (the caller then adds a checkout entry as before).
function attachAppearance(hearings, hearingId, appearance) {
  const list = Array.isArray(hearings) ? hearings.map(h => ({ ...h })) : [];
  const i = hearingId ? list.findIndex(h => h && h.id === hearingId && !['continued', 'off-calendar', 'vacated', 'cancelled'].includes(h.outcome)) : -1;
  if (i < 0) return null;
  list[i] = { ...list[i], appearanceRequested: true, appearance: { ...(list[i].appearance || {}), ...appearance } };
  return list;
}

// Short notice (fewer than 7 days to the hearing): the office confirms, or declines and the payment is refunded.
function shortNoticeFields(on) {
  return on ? { shortNotice: true, confirmation: 'pending', shortNoticeAt: admin.firestore.Timestamp.now() } : {};
}

module.exports = { shortNoticeFields, hearingEntry, unpackHearing, legacyHearingDetails, mapType, continueHearing, attachAppearance };
