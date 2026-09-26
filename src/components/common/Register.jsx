import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, AlertCircle, CheckCircle } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { startGuestAccount } from '../../utils/guestAccount';
import ProviderButtons from './ProviderButtons';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // The email already has an account: sign in instead of creating another one
  const [exists, setExists] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // No password here: the account is created from the email, and the client sets a
  // password (or connects Google/Apple) after paying, or from the "Set Your Password" email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExists(false);
    setLoading(true);
    try {
      const status = await startGuestAccount({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        source: 'intake'
      });
      if (status === 'exists') {
        setExists(true);
        return;
      }
      navigate('/intake');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to start your case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const afterProvider = async () => {
    try { await httpsCallable(functions, 'ensureMyProfile')(); } catch (err) { console.error('Profile check failed:', err); }
    navigate('/intake');
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
            Start Your Probate Case
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete California Probate for $3,995
          </p>
        </div>

        {/* Features */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">What's Included:</p>
          <ul className="space-y-1">
            {[
              'Step-by-step guidance through all 11 phases',
              'All court forms prepared and filed',
              'Publication coordination',
              'Dedicated support throughout'
            ].map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-blue-800">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {exists && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900" data-testid="account-exists">
            <strong>{formData.email}</strong> already has an account. <Link to="/login" className="font-semibold underline">Sign in</Link> to continue your case. If you never set a password, use "Forgot password?" on the sign-in page.
          </div>
        )}

        {/* Google / Apple */}
        <ProviderButtons
          onSignedIn={afterProvider}
          onAccountExists={() => setExists(true)}
          onRelayExisting={() => navigate('/login')}
          onError={setError}
        />
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs uppercase tracking-wide text-gray-500">or continue with your email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Register Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

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
              value={formData.email}
              onChange={handleChange}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="(818) 555-1234"
            />
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
                Starting…
              </div>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">Law Offices of Rozsa Gyene · 3500 W. Olive Ave., Suite 300, Burbank, CA 91505 · 818-337-4071</p>
      </div>
    </div>
  );
};

export default Register;
