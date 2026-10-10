// Shared Admin SDK setup and caller checks for the payment functions (W2-payments).
const admin = require('firebase-admin');

const ALLOWED_ORIGINS = [
  'https://myprobateca.com',
  'https://www.myprobateca.com',
  'https://portal.myprobateca.com',
  'http://localhost:5173',
  'http://localhost:8210',
  'http://localhost:8888'
];

function getDb() {
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (!sa.project_id || !sa.private_key || !sa.client_email) throw new Error('FIREBASE_SERVICE_ACCOUNT not set');
    admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
  }
  return admin.firestore();
}

function corsHeaders(event, methods = 'POST, OPTIONS') {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : 'https://myprobateca.com',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': methods,
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
}

// Verifies the Firebase ID token in "Authorization: Bearer <token>". Returns the decoded token or null.
async function verifyCaller(event) {
  const h = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  const m = /^Bearer\s+(.+)$/.exec(h);
  if (!m) return null;
  getDb();
  try { return await admin.auth().verifyIdToken(m[1]); } catch { return null; }
}

// Same admin test as firestore.rules isAdmin(): `admin` claim on a verified email.
function isAdminToken(t) {
  return !!t && t.admin === true && t.email_verified === true;
}

module.exports = { admin, getDb, corsHeaders, verifyCaller, isAdminToken, ALLOWED_ORIGINS };
