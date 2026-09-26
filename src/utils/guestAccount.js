import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../services/firebase';

// First step of starting a case, paying or booking for someone not signed in: a new email gets
// its own account and is signed in right away; an email that already has an account must sign in.
// Returns 'created' or 'exists'. Throws with a friendly message on failure.
export async function startGuestAccount({ name, email, phone, source }) {
  const response = await fetch('/.netlify/functions/guest-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, source })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Please try again, or call 818-337-4071.');
  if (data.status === 'created') {
    await signInWithCustomToken(auth, data.token);
  }
  return data.status;
}
