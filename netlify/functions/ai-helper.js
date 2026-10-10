// Item 69 (HOLD): case-aware helper for the client home (portal.myprobateca.com/ask).
// Server-side only: uses this site's existing ANTHROPIC_API_KEY. Requires a Firebase sign-in that owns
// the case (or the attorney). Rate limited per person. Never logs questions, answers or case data.
// Off until Rozsa approves: config/beyondFeatures.aiHelper must be true (test inboxes excepted, for the demo).
const Anthropic = require('@anthropic-ai/sdk');
const admin = require('firebase-admin');
const { buildSystem, caseSummary, OUTPUT_SCHEMA } = require('./ai-helper-prompt');

const MODEL = 'claude-opus-5-5';
const TEST_INBOX = /^rozsagyenelaw1\+[a-z0-9._-]+@gmail\.com$/i;
const ORIGINS = ['https://portal.myprobateca.com', 'https://myprobateca.com', 'http://localhost:8310'];
const SYSTEM = buildSystem();
const FALLBACK_ANSWER = 'I am not able to answer that here. Please send your question to Rozsa with the button below, or call our office at 818-337-4071.';

function app() {
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
  }
  return admin;
}

async function rateLimit(db, uid) {
  const ref = db.collection('beyondRateLimits').doc(`ai-${uid}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const d = snap.exists ? snap.data() : {};
    const sameMinute = d.minuteStart && now - d.minuteStart < 60000;
    const minuteCount = sameMinute ? d.minuteCount || 0 : 0;
    const day = new Date(now).toISOString().slice(0, 10);
    const dayCount = d.day === day ? d.dayCount || 0 : 0;
    if (minuteCount >= 6 || dayCount >= 40) return false;
    tx.set(ref, { minuteStart: sameMinute ? d.minuteStart : now, minuteCount: minuteCount + 1, day, dayCount: dayCount + 1 });
    return true;
  });
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  const out = [];
  for (const h of history.slice(-10)) {
    if (!h || !['user', 'assistant'].includes(h.role) || typeof h.text !== 'string') continue;
    const text = h.text.slice(0, 1500).trim();
    if (!text) continue;
    if (out.length && out[out.length - 1].role === h.role) continue; // keep turns alternating
    out.push({ role: h.role, content: text });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  if (out.length && out[out.length - 1].role === 'user') out.pop();
  return out;
}

async function ask(client, { caseData, deadlines = [], history = [], question }) {
  const messages = [
    ...cleanHistory(history),
    { role: 'user', content: `${caseSummary(caseData, deadlines)}\n\n<question>\n${question}\n</question>` },
  ];
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 2000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral', ttl: '1h' } }],
    output_config: { effort: 'low', format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    messages,
  });
  if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') {
    return { answer: FALLBACK_ANSWER, handoff: true, topic: 'Question for Rozsa' };
  }
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const parsed = JSON.parse(text);
    return {
      answer: String(parsed.answer || FALLBACK_ANSWER).replace(/[\u2013\u2014]/g, ', '),
      handoff: parsed.handoff === true,
      topic: String(parsed.topic || '').slice(0, 60),
      usage: { input: response.usage.input_tokens, cached: response.usage.cache_read_input_tokens, output: response.usage.output_tokens },
    };
  } catch {
    return { answer: FALLBACK_ANSWER, handoff: true, topic: 'Question for Rozsa' };
  }
}

exports.ask = ask;

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = {
    'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const auth = (event.headers.authorization || event.headers.Authorization || '').match(/^Bearer (.+)$/);
  let decoded;
  try {
    decoded = auth ? await app().auth().verifyIdToken(auth[1]) : null;
  } catch {
    decoded = null;
  }
  if (!decoded) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Please sign in.' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const question = typeof body.question === 'string' ? body.question.trim().slice(0, 1000) : '';
  if (!question || typeof body.caseId !== 'string') return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please type a question.' }) };

  const db = app().firestore();
  const flags = (await db.doc('config/beyondFeatures').get()).data() || {};
  if (flags.aiHelper !== true && !TEST_INBOX.test(decoded.email || '')) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'The helper is not available yet.' }) };
  }
  const caseSnap = await db.collection('cases').doc(body.caseId).get();
  const isAdmin = decoded.admin === true && decoded.email_verified === true;
  if (!caseSnap.exists || (!isAdmin && caseSnap.data().userId !== decoded.uid)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Not your case.' }) };
  }
  if (!(await rateLimit(db, decoded.uid))) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'You have asked many questions in a short time. Please wait a little and try again, or send your question to Rozsa.' }) };
  }

  const started = Date.now();
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const result = await ask(client, { caseData: caseSnap.data(), history: body.history, question });
    console.log('ai-helper ok', JSON.stringify({ ms: Date.now() - started, handoff: result.handoff, ...(result.usage || {}) }));
    delete result.usage;
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (err) {
    console.error('ai-helper error', err?.status || err?.name || 'error');
    return { statusCode: 502, headers, body: JSON.stringify({ error: FALLBACK_ANSWER }) };
  }
};
