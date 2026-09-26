import React, { useState } from 'react';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, OAuthProvider, getAdditionalUserInfo, deleteUser } from 'firebase/auth';
import { auth } from '../../services/firebase';

// Apple appears once Sign in with Apple is configured for the Firebase project
export const APPLE_ENABLED = import.meta.env.VITE_APPLE_SIGN_IN === 'true';
// After "Yes, I already have an account" on a Hide My Email sign-in, the next sign-in offers to connect Apple
export const CONNECT_APPLE_FLAG = 'connectAppleAfterSignIn';

export const appleProvider = () => {
  const p = new OAuthProvider('apple.com');
  p.addScope('email');
  p.addScope('name');
  return p;
};

export const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z"/>
  </svg>
);

export const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.37 12.62c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.4-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.1 1.76-.96 2.79 1.01.08 2.05-.51 2.68-1.27z"/>
  </svg>
);

/**
 * Continue with Google / Continue with Apple.
 * - onSignedIn(user): signed in (existing or genuinely new account)
 * - onAccountExists({ credential, email, providerName }): the email already has an account;
 *   the page asks for the usual sign-in and then links the credential
 * - onRelayExisting(): Hide My Email sign-in, person says they already have an account;
 *   the new empty account was removed and the page should ask for the usual sign-in
 */
const ProviderButtons = ({ onSignedIn, onAccountExists, onRelayExisting, onError }) => {
  const [relayUser, setRelayUser] = useState(null);

  const run = async (providerName) => {
    const provider = providerName === 'Apple' ? appleProvider() : new GoogleAuthProvider();
    if (providerName === 'Google') provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const cred = await signInWithPopup(auth, provider);
      const info = getAdditionalUserInfo(cred);
      if (providerName === 'Apple' && info?.isNewUser && /@privaterelay\.appleid\.com$/i.test(cred.user.email || '')) {
        setRelayUser(cred.user);
        return;
      }
      await onSignedIn(cred.user);
    } catch (err) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        const credential = providerName === 'Apple' ? OAuthProvider.credentialFromError(err) : GoogleAuthProvider.credentialFromError(err);
        onAccountExists({ credential, email: err.customData?.email || '', providerName });
      } else if (err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
      } else if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err.code)) {
        onError('Sign-in did not complete. Please try again, or call 818-337-4071.');
      }
    }
  };

  if (relayUser) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-3" data-testid="relay-prompt">
        <p className="font-semibold">Do you already have a client account with us?</p>
        <p>You chose to hide your email, so Apple gave us a private address. If you already booked, paid or received documents from our office, choose "Yes" and sign in once the usual way; Apple will then be connected to that same account.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button type="button" className="flex-1 py-2 rounded-lg bg-blue-900 text-white font-semibold" onClick={async () => {
            try { await deleteUser(relayUser); } catch (e) { console.error('Could not remove the new Apple account:', e); }
            sessionStorage.setItem(CONNECT_APPLE_FLAG, '1');
            setRelayUser(null);
            onRelayExisting();
          }}>Yes, I already have an account</button>
          <button type="button" className="flex-1 py-2 rounded-lg border border-blue-300 bg-white font-semibold" onClick={async () => {
            const u = relayUser; setRelayUser(null); await onSignedIn(u);
          }}>No, I am new</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => run('Google')}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-50">
        <GoogleIcon /> Continue with Google
      </button>
      {APPLE_ENABLED && (
        <button type="button" onClick={() => run('Apple')}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-black text-white font-medium hover:bg-gray-900">
          <AppleIcon /> Continue with Apple
        </button>
      )}
    </div>
  );
};

export default ProviderButtons;
