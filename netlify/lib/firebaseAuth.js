// Shared Firebase Admin setup and ID-token checks for Netlify functions
const admin = require('firebase-admin');

// Temporary fallback until the `admin` custom claim is set on the attorney's accounts.
// Both addresses already have accounts, so nobody else can register them.
const LEGACY_ADMIN_EMAILS = ['rozsagyenelaw@yahoo.com', 'rozsagyenelaw1@gmail.com'];

function getAdminApp() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  }
  return admin;
}

function isAdminToken(decoded) {
  if (decoded.admin === true && decoded.email_verified === true) return true;
  return LEGACY_ADMIN_EMAILS.includes(decoded.email);
}

// Returns the decoded token, or null when the Authorization header is missing or invalid
async function verifyRequest(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return null;
  try {
    return await getAdminApp().auth().verifyIdToken(match[1]);
  } catch (err) {
    console.error('ID token verification failed:', err.message);
    return null;
  }
}

async function userOwnsCase(uid, caseId) {
  if (!caseId || typeof caseId !== 'string') return false;
  const snap = await getAdminApp().firestore().collection('cases').doc(caseId).get();
  return snap.exists && snap.data().userId === uid;
}

module.exports = { getAdminApp, isAdminToken, verifyRequest, userOwnsCase };
