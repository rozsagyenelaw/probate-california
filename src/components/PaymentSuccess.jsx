import { useEffect, useState, useRef } from 'react';
import { trackPurchase } from '../services/analytics';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccountSetup from './common/AccountSetup';
import GuestNextStep from './common/GuestNextStep';
import { GUEST_EMAIL_KEY } from '../utils/guestAccount';
import {
  CheckCircle,
  ArrowRight,
  FileText,
  Clock,
  Users,
  Shield
} from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const conversionStarted = useRef(false);
  // The page stays until the client can come back: a password, Google or Apple on the account
  const [setupDone, setSetupDone] = useState(false);
  // Ready = a password, Google or Apple is on the account (or the visitor is signed out and signs in at the client home)
  const accountReady = setupDone || (!authLoading && (!user || (user.providerData || []).length > 0));

  const sessionId = searchParams.get('session_id');
  // Guests come back from checkout signed out; the email they paid with was kept for this page
  const guestEmail = (() => { try { return sessionStorage.getItem(GUEST_EMAIL_KEY) || ''; } catch { return ''; } })();
  const shownEmail = user?.email || guestEmail;
  // Purchase conversion (Google Ads + GA4). The page is public, so it fires even when the buyer
  // returns from Stripe signed out. The session is checked with Stripe first (paid, amount charged)
  // and recorded once per checkout session on this browser; Google also dedupes on transaction_id.
  useEffect(() => {
    if (conversionStarted.current) return;
    conversionStarted.current = true;
    if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) return;
    const key = `mpca_purchase_${sessionId}`;
    try { if (localStorage.getItem(key)) return; } catch { /* storage blocked: Google dedupes */ }
    const urlAmount = parseFloat(searchParams.get('amount'));
    (async () => {
      let value = Number.isFinite(urlAmount) ? urlAmount : null;
      let service = 'probate';
      try {
        const r = await fetch(`/.netlify/functions/checkout-session-status?session_id=${encodeURIComponent(sessionId)}`);
        const status = await r.json();
        if (status.paid === false) return; // unpaid, unknown or expired session: record nothing
        if (r.ok && typeof status.amount === 'number') value = status.amount;
        if (status.service) service = status.service;
      } catch { /* check unavailable: fall back to the amount in the return address */ }
      trackPurchase(sessionId, value ?? 0, service);
      try { localStorage.setItem(key, String(Date.now())); } catch { /* ignore */ }
    })();
  }, [sessionId, searchParams]);

  // Decision 32 (W3-home): a client who paid from the portal flow goes on to the thank-you page in the
  // client home, where they are signed in and set their password. The purchase is recorded first.
  const toPortal = searchParams.get('next') === 'portal';
  useEffect(() => {
    if (!toPortal) return undefined;
    const t = setTimeout(() => {
      // kind=addon: a service added from the client home (its own thank-you text there, W6 F35)
      const kind = searchParams.get('kind') === 'addon' ? '&kind=addon' : '';
      window.location.replace(`https://portal.myprobateca.com/?tab=thanks${kind}${sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ''}`);
    }, 2500);
    return () => clearTimeout(t);
  }, [toPortal, sessionId, searchParams]);
  if (toPortal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <p className="text-lg text-gray-900" role="status">Payment received. Opening your client home…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment received. Thank you.
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for choosing the Law Offices of Rozsa Gyene
          </p>
        </div>

        {/* One step to finish the account created at checkout (hidden once a password, Google or Apple exists) */}
        {user ? (
          <div className="mb-8">
            <AccountSetup email={user.email} onDone={() => setSetupDone(true)} />
          </div>
        ) : (
          <div className="mb-8">
            <GuestNextStep email={guestEmail} />
          </div>
        )}

        {/* Confirmation Box */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-800">Your payment is recorded</h3>
                <p className="text-green-700 text-sm mt-1">
                  A confirmation email is on its way to <strong className="break-all">{shownEmail || 'your email'}</strong>
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">What Happens Next?</h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-900" />
                  Rozsa reviews your information (1 to 2 business days)
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Nothing is needed from you until then. Your client home shows what happens next.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-900" />
                  Your court papers
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Her office prepares your court papers. We email you when they are ready for you to read and sign in your client home.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-900" />
                  Ongoing Support
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Your client home shows your next step, the documents to read and sign, and your messages with our office.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client home button: only once the client can sign in again (password, Google or Apple) */}
        <div className="text-center mb-8" data-testid="client-home-cta">
          {accountReady ? (
            <a
              href="https://portal.myprobateca.com/?tab=intake"
              className="inline-flex items-center bg-blue-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition-colors"
            >
              Go to your client home
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </a>
          ) : (
            <p className="text-gray-700">Set your password above, or continue with Google or Apple, so you can sign in to your client home from any device.</p>
          )}
        </div>

        {/* Questions: portal messages first (client experience rule); contact details stay in the footer line */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-800">Questions? Send us a message in your client home. We answer there.</p>
          <p className="text-gray-500 text-sm mt-4">
            Law Offices of Rozsa Gyene | California State Bar #208356
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
