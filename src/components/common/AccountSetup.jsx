import React, { useState } from 'react';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { updatePassword, linkWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '../../services/firebase';

const APPLE_ENABLED = import.meta.env.VITE_APPLE_SIGN_IN === 'true';

/**
 * Shown on the booking confirmation (and payment thank-you) page to a client whose account
 * was just created from their email. One step: choose a password, or connect Google or Apple.
 * All three are added to the same signed-in account, so nothing already in it is lost.
 */
const AccountSetup = ({ email, onDone }) => {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const user = auth.currentUser;
  if (!user) return null;
  const methods = user.providerData.map(p => p.providerId);
  if (done || methods.length > 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex gap-3" data-testid="account-ready">
        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-gray-900">Your client portal account is ready</p>
          <p className="text-sm text-gray-700">{done || 'You can sign in any time'} with <strong>{email || user.email}</strong>.</p>
        </div>
      </div>
    );
  }

  const finish = (msg) => { setDone(msg); if (onDone) onDone(); };

  const savePassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Please use at least 8 characters.');
    setBusy(true);
    try {
      await updatePassword(user, password);
      finish('Password saved. Sign in any time');
    } catch (err) {
      setError(err.code === 'auth/requires-recent-login'
        ? 'For your security, use the "Set Your Password" email we sent you to finish.'
        : 'The password was not saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const connect = async (providerName) => {
    setError('');
    setBusy(true);
    const provider = providerName === 'Apple' ? new OAuthProvider('apple.com') : new GoogleAuthProvider();
    if (providerName === 'Apple') { provider.addScope('email'); provider.addScope('name'); }
    else provider.setCustomParameters({ prompt: 'select_account', login_hint: email || user.email });
    try {
      await linkWithPopup(user, provider);
      finish(`${providerName} connected. Sign in any time with ${providerName} or`);
    } catch (err) {
      if (err.code === 'auth/credential-already-in-use') {
        setError(`That ${providerName} account is already connected to a different client portal account. Please choose a password instead, or call 818-337-4071.`);
      } else if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err.code)) {
        setError(`${providerName} did not connect. Please try again, or choose a password.`);
      }
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'block w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-600';
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6" data-testid="account-setup">
      <h3 className="text-lg font-bold text-gray-900">Set your password</h3>
      <p className="mt-1 text-sm text-gray-600">Your client portal account is created. Choose a password so you can come back from any device.</p>
      <form onSubmit={savePassword} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email || user.email || ''} readOnly autoComplete="username" className={`${inputClass} bg-gray-50 text-gray-700`} />
        </div>
        <div>
          <label htmlFor="setup-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input id="setup-password" type={show ? 'text' : 'password'} autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-11`} placeholder="At least 8 characters" />
            <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="w-full py-3 rounded-lg bg-blue-900 text-white font-semibold disabled:opacity-50">
          {busy ? 'Saving…' : 'Save password'}
        </button>
      </form>
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" /><span className="text-xs uppercase tracking-wide text-gray-500">or</span><div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="space-y-3">
        <button type="button" onClick={() => connect('Google')} disabled={busy}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-50 disabled:opacity-50">
          <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          Continue with Google
        </button>
        {APPLE_ENABLED && (
          <button type="button" onClick={() => connect('Apple')} disabled={busy}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-900 disabled:opacity-50">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.37 12.62c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.4-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.1 1.76-.96 2.79 1.01.08 2.05-.51 2.68-1.27z"/></svg>
            Continue with Apple
          </button>
        )}
      </div>
      <p className="mt-4 text-xs text-gray-500">Not now? We will email you a "Set Your Password" link as a backup.</p>
    </div>
  );
};

export default AccountSetup;
