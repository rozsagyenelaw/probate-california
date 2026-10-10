// Retired 2026-10-10 (W1-security). The guest first step is now the portal Cloud Function
// `startClientAccount`, which is rate limited, gives the same answer for every email and never
// returns a sign-in token. This endpoint stays only so a page opened before the change does not
// break: it creates nothing, sends nothing and gives the same neutral answer to everyone.
const ALLOWED_ORIGINS = ['https://myprobateca.com', 'https://www.myprobateca.com', 'https://portal.myprobateca.com'];

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : 'https://myprobateca.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
};
