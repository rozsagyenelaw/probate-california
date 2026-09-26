// First step of booking or payment for someone who is not signed in.
// A new email gets a real Firebase account right away (no password yet) and a one-time
// sign-in token, so the guest continues inside their own account. An email that already
// has an account is told to sign in instead. Never anonymous; one account per email.
const admin = require('firebase-admin');

const ALLOWED_ORIGINS = ['https://myprobateca.com', 'https://www.myprobateca.com', 'https://portal.myprobateca.com', 'http://localhost:5173'];

function getAdminApp() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId: serviceAccount.project_id });
  }
  return admin;
}

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : 'https://myprobateca.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }; }
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 120);
  const phone = String(body.phone || '').trim().slice(0, 40);
  const source = ['booking', 'payment', 'intake'].includes(body.source) ? body.source : 'booking';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please enter your name and a valid email address.' }) };
  }

  const fb = getAdminApp();
  try {
    await fb.auth().getUserByEmail(email);
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'exists' }) };
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      console.error('Account lookup failed:', err.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Please try again, or call 818-337-4071.' }) };
    }
  }

  const user = await fb.auth().createUser({ email, displayName: name, emailVerified: false });
  const { firstName, lastName } = splitName(name);
  await fb.firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    email,
    firstName,
    lastName,
    phone,
    role: 'client',
    source,
    // Backup "Set Your Password" email goes out if no password or Google/Apple is added soon
    welcomePending: true,
    createdAt: fb.firestore.FieldValue.serverTimestamp()
  });
  const token = await fb.auth().createCustomToken(user.uid);
  console.log(`Guest account created for ${source}: ${user.uid}`);
  return { statusCode: 200, headers, body: JSON.stringify({ status: 'created', token }) };
};
