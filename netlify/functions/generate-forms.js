/**
 * Court-form generation for the main site, routed to the MyProbateCA form generator
 * (probate-form-automation, function `generate`), the same engine the portal admin uses.
 * Attorney sign-in required: the caller's Firebase ID token is passed through and checked by
 * the generator (admin claim on a verified email). No client data goes in a web address.
 * The previous implementation (which posted to a site with no functions) is kept in
 * generate-forms.legacy.txt.
 */
const GENERATOR = process.env.FORMS_GENERATOR_URL || 'https://probateformautomation.netlify.app/.netlify/functions/generate';
const ORIGINS = ['https://myprobateca.com', 'https://www.myprobateca.com', 'http://localhost:8290'];

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = { 'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0], 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  const authz = event.headers.authorization || event.headers.Authorization;
  if (!authz) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Sign in required' }) };
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad JSON' }) }; }
  const payload = body.action ? body : { action: 'generate', formId: body.formId || 'DE-111', caseData: body.caseData || body, answers: body.answers || {}, overrides: body.overrides || {} };
  try {
    const r = await fetch(GENERATOR, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: authz }, body: JSON.stringify(payload) });
    const text = await r.text();
    return { statusCode: r.status, headers, body: text };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Form generator unavailable' }) };
  }
};
