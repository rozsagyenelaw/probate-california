// Central failure alert for Netlify functions (W1-infra, item 11). Same contract as the Cloud Functions helper
// (myprobateca-portal functions/lib/alert.js): an ERROR entry with the marker MPCA_ALERT and field mpcaAlert=<kind>.
// Netlify logs are not watched, so the entry is ALSO written to Google Cloud Logging (log "netlify-functions",
// resource "global") with the service account in FIREBASE_SERVICE_ACCOUNT (needs roles/logging.logWriter).
// The alert policy "MyProbateCA email or text failed" then emails rozsagyenelaw1@gmail.com.
// Usage:  const { alertFailure } = require('./lib/alert');
//         await alertFailure('payment_failed', 'Webhook could not record a payment', { fn: 'stripe-webhook', error: err.message });
// Never throws. Never put passwords, tokens, card data, full emails or phone numbers in details.
const admin = require('firebase-admin');

const MARKER = 'MPCA_ALERT';
const PROJECT = 'probate-california';

let credential = null;
function getCredential() {
  if (credential) return credential;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  credential = admin.credential.cert(JSON.parse(raw));
  return credential;
}

async function alertFailure(kind, message, details = {}) {
  const text = `${MARKER} ${kind}: ${message}`;
  console.error(JSON.stringify({ severity: 'ERROR', message: text, mpcaAlert: kind, ...details }));
  try {
    const cred = getCredential();
    if (!cred) return;
    const { access_token: token } = await cred.getAccessToken();
    const res = await fetch('https://logging.googleapis.com/v2/entries:write', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logName: `projects/${PROJECT}/logs/netlify-functions`,
        resource: { type: 'global', labels: { project_id: PROJECT } },
        entries: [{ severity: 'ERROR', jsonPayload: { message: text, mpcaAlert: kind, source: 'netlify', site: process.env.SITE_NAME || null, ...details } }]
      })
    });
    if (!res.ok) console.error(`${MARKER} could not write to Cloud Logging: HTTP ${res.status}`);
  } catch (err) {
    console.error(`${MARKER} could not write to Cloud Logging: ${err.message}`);
  }
}

module.exports = { alertFailure, MARKER };
