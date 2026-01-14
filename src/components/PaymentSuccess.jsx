import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  FileText,
  Clock,
  Users,
  Shield
} from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const conversionFired = useRef(false);

  const sessionId = searchParams.get('session_id');
  // Get payment amount from URL params (set by checkout), default to full probate price
  const paymentAmount = parseFloat(searchParams.get('amount')) || 3995;

  // Fire Google Ads conversion tracking
  useEffect(() => {
    // Only fire once to prevent duplicate conversions
    if (conversionFired.current) return;
    conversionFired.current = true;

    // Google Ads conversion tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-989094207/t7cOCJ6lr-gaEL_C0dcD',
        'value': paymentAmount,
        'currency': 'USD',
        'transaction_id': sessionId || undefined
      });
      console.log('Google Ads conversion fired:', {
        value: paymentAmount,
        currency: 'USD',
        transaction_id: sessionId
      });
    }
  }, [paymentAmount, sessionId]);

  useEffect(() => {
    // Auto-redirect to dashboard after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for choosing the Law Offices of Rozsa Gyene
          </p>
        </div>

        {/* Confirmation Box */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-800">Your Case Has Been Activated</h3>
                <p className="text-green-700 text-sm mt-1">
                  A confirmation email has been sent to <strong>{user?.email}</strong>
                </p>
                {sessionId && (
                  <p className="text-green-600 text-xs mt-2">
                    Reference: {sessionId.slice(0, 20)}...
                  </p>
                )}
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
                  Case Review (24-48 hours)
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Attorney Rozsa Gyene will personally review your case information and begin preparing your initial court filings.
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
                  Document Preparation
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  We'll prepare all necessary petitions, notices, and court documents. You'll receive notifications as each phase progresses.
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
                  Track your case progress online, request signature documents, and communicate with our team throughout the entire process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center bg-blue-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition-colors"
          >
            Go to Your Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <p className="text-gray-500 text-sm mt-3">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-4">Questions? We're Here to Help</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="tel:818-291-6217"
              className="flex items-center text-blue-900 hover:text-blue-700"
            >
              <Phone className="h-5 w-5 mr-2" />
              (818) 291-6217
            </a>
            <a
              href="mailto:rozsa@myprobateca.com"
              className="flex items-center text-blue-900 hover:text-blue-700"
            >
              <Mail className="h-5 w-5 mr-2" />
              rozsa@myprobateca.com
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Law Offices of Rozsa Gyene | California State Bar #208356
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
