import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

export const GUEST_EMAIL_KEY = 'mpca-guest-email';

// First step for a guest who pays or starts a case. The server makes sure the account for this
// email exists. The answer is the same whether or not the email already had an account, and the
// browser is not signed in: the client proves the email is theirs from the emailed link, or with
// Google or Apple. Throws with a friendly message on failure.
export async function startGuestAccount({ name, email, phone, source }) {
  try {
    await httpsCallable(functions, 'startClientAccount')({ name, email, phone, source });
  } catch (err) {
    const known = ['functions/invalid-argument', 'functions/resource-exhausted'].includes(err.code);
    throw new Error(known ? String(err.message).replace(/\s*\[\d+\]$/, '') : 'Please try again in a moment. If it keeps happening, our contact details are at the bottom of myprobateca.com.');
  }
  try { sessionStorage.setItem(GUEST_EMAIL_KEY, String(email).trim().toLowerCase()); } catch { /* private mode */ }
  return 'ok';
}
