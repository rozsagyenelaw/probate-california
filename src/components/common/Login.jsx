import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Scale, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, OAuthProvider, linkWithCredential } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../services/firebase';

// Apple appears once Sign in with Apple is configured for the Firebase project
const APPLE_ENABLED = import.meta.env.VITE_APPLE_SIGN_IN === 'true';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.37 12.62c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.4-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.1 1.76-.96 2.79 1.01.08 2.05-.51 2.68-1.27z"/>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null); // Google/Apple credential waiting to be linked
  const { login } = useAuth();
  const navigate = useNavigate();

  // One email is one account: link a pending Google/Apple sign-in, make sure the profile exists
  const afterSignIn = async (user) => {
    if (pending) {
      try { await linkWithCredential(user, pending.credential); } catch (err) { console.error('Could not link sign-in method:', err); }
      setPending(null);
    }
    try { await httpsCallable(functions, 'ensureMyProfile')(); } catch (err) { console.error('Profile check failed:', err); }
  };

  const handleProvider = async (providerName) => {
    setError('');
    const provider = providerName === 'Apple' ? new OAuthProvider('apple.com') : new GoogleAuthProvider();
    if (providerName === 'Apple') { provider.addScope('email'); provider.addScope('name'); }
    else provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const cred = await signInWithPopup(auth, provider);
      await afterSignIn(cred.user);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        const credential = providerName === 'Apple' ? OAuthProvider.credentialFromError(err) : GoogleAuthProvider.credentialFromError(err);
        setPending({ credential, email: err.customData?.email || '', providerName });
        setEmail(err.customData?.email || '');
      } else if (err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
      } else if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err.code)) {
        setError('Sign-in did not complete. Please try again, or call 818-337-4071.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const signedIn = await login(email, password);
      if (signedIn) await afterSignIn(signedIn);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-900 p-3 rounded-full">
              <Scale className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            California Probate
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Law Offices of Rozsa Gyene
          </p>
          <p className="mt-4 text-gray-500">
            Sign in to your account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {pending && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            You already have an account with <strong>{pending.email}</strong>. Sign in with your password once, and {pending.providerName} will be added to that same account.
          </div>
        )}

        {/* Google / Apple */}
        <div className="mt-6 space-y-3">
          <button type="button" onClick={() => handleProvider('Google')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-50">
            <GoogleIcon /> Continue with Google
          </button>
          {APPLE_ENABLED && (
            <button type="button" onClick={() => handleProvider('Apple')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-black text-white font-medium hover:bg-gray-900">
              <AppleIcon /> Continue with Apple
            </button>
          )}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs uppercase tracking-wide text-gray-500">or use your email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Start your probate case
            </Link>
          </p>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Questions? Call (818) 291-6217
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Law Offices of Rozsa Gyene | 450 N Brand Blvd Suite 600, Glendale, CA 91203
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
