import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import ProviderButtons from './ProviderButtons';

/**
 * Shown after a guest pays (not signed in). It looks the same for every email: continue with
 * Google or Apple, or have the link to set a password emailed. Nothing here shows whether the
 * email already had an account, and nobody is signed in until they prove the email is theirs.
 */
const GuestNextStep = ({ email, next = '/dashboard' }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const emailLink = async () => {
    setBusy(true);
    setError('');
    try {
      await httpsCallable(functions, 'sendPasswordResetEmail')({ email });
    } catch (err) {
      if (err.code === 'functions/resource-exhausted') { setError(err.message); setBusy(false); return; }
      console.error('Link request failed:', err);
    }
    setBusy(false);
    setMessage(`We sent a link to ${email}. Open it to set your password and sign in.`);
  };

  const afterProvider = async () => {
    try { await httpsCallable(functions, 'ensureMyProfile')(); } catch (err) { console.error('Profile check failed:', err); }
    navigate(next);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-5 sm:p-6" data-testid="guest-next-step">
      <h2 className="text-lg font-bold text-gray-900">Sign in to follow your case</h2>
      <p className="mt-1 text-sm text-gray-700">
        Your receipt and the next steps go to {email ? <strong>{email}</strong> : 'your email'}. To see your case online, continue with Google or Apple, or use the link we email you to choose a password.
      </p>
      <div className="mt-4">
        <ProviderButtons onSignedIn={afterProvider} onAccountExists={() => navigate('/login', { state: { from: next } })} onRelayExisting={() => navigate('/login', { state: { from: next } })} onError={setError} />
      </div>
      {email && (
        <button type="button" onClick={emailLink} disabled={busy} className="mt-3 w-full py-3 rounded-lg border border-blue-300 text-blue-900 font-semibold disabled:opacity-50">
          {busy ? 'One moment…' : 'Email me a link to set my password'}
        </button>
      )}
      {message && <p className="mt-3 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-3">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
    </div>
  );
};

export default GuestNextStep;
