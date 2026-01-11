import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CreditCard,
  Check,
  Shield,
  Phone,
  ArrowLeft,
  Calendar,
  Home,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();

  const [selectedType, setSelectedType] = useState('full');
  const [selectedPlan, setSelectedPlan] = useState('full');
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    // Check if payment was canceled
    if (searchParams.get('canceled') === 'true') {
      setCanceled(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/payment' } });
    }
  }, [user, authLoading, navigate]);

  const handlePayment = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/payment' } });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          probateType: selectedType,
          paymentPlan: selectedPlan,
          customerEmail: user.email,
          caseId: '', // Will be associated later if needed
          promoCode: promoCode.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An error occurred. Please try again or contact us at (818) 291-6217.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pricing calculations
  const prices = {
    simplified: {
      full: 2495,
      installment: 832, // $2,495 / 3 = $831.67, rounded to $832
    },
    full: {
      full: 3995,
      installment: 1332, // $3,995 / 3 = $1,331.67, rounded to $1,332
    },
  };

  const currentPrice = selectedPlan === 'full'
    ? prices[selectedType].full
    : prices[selectedType].installment;

  const totalPrice = prices[selectedType].full;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-4">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Payment
          </h1>
          <p className="text-gray-600">
            Select your probate service and payment option below
          </p>
        </div>

        {canceled && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Payment Canceled</p>
              <p className="text-sm">Your payment was canceled. You can try again below.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Payment Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Service Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-900" />
              Select Service Type
            </h2>

            {/* Simplified Probate */}
            <div
              onClick={() => setSelectedType('simplified')}
              className={`border-2 rounded-lg p-4 mb-4 cursor-pointer transition-all ${
                selectedType === 'simplified'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-bold text-gray-900">Simplified Probate</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    For primary residences valued under $750,000
                  </p>
                  <p className="text-2xl font-bold text-green-600">$2,495</p>
                  <p className="text-xs text-gray-500">or 3 payments of $832</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedType === 'simplified' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {selectedType === 'simplified' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Faster court process
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Fewer required hearings
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Full attorney supervision
                </li>
              </ul>
            </div>

            {/* Full Probate */}
            <div
              onClick={() => setSelectedType('full')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative ${
                selectedType === 'full'
                  ? 'border-blue-900 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="absolute -top-3 left-4">
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  MOST COMMON
                </span>
              </div>
              <div className="flex items-start justify-between mt-2">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Building2 className="h-5 w-5 text-blue-900 mr-2" />
                    <h3 className="font-bold text-gray-900">Full Probate</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    For all estates requiring formal probate
                  </p>
                  <p className="text-2xl font-bold text-blue-900">$3,995</p>
                  <p className="text-xs text-gray-500">or 3 payments of $1,332</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedType === 'full' ? 'border-blue-900 bg-blue-900' : 'border-gray-300'
                }`}>
                  {selectedType === 'full' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-blue-900 mr-2 flex-shrink-0" />
                  Complete 11-phase handling
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-blue-900 mr-2 flex-shrink-0" />
                  All court filings included
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-blue-900 mr-2 flex-shrink-0" />
                  Full attorney supervision
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-900" />
              Payment Option
            </h2>

            {/* Pay in Full */}
            <div
              onClick={() => setSelectedPlan('full')}
              className={`border-2 rounded-lg p-4 mb-4 cursor-pointer transition-all ${
                selectedPlan === 'full'
                  ? 'border-blue-900 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Pay in Full</h3>
                  <p className="text-sm text-gray-600">One-time payment</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${prices[selectedType].full.toLocaleString()}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${
                  selectedPlan === 'full' ? 'border-blue-900 bg-blue-900' : 'border-gray-300'
                }`}>
                  {selectedPlan === 'full' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
            </div>

            {/* Payment Plan */}
            <div
              onClick={() => setSelectedPlan('installments')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlan === 'installments'
                  ? 'border-blue-900 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    3 Monthly Payments
                  </h3>
                  <p className="text-sm text-gray-600">No extra charge</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${prices[selectedType].installment.toLocaleString()}/mo
                  </p>
                  <p className="text-xs text-gray-500">
                    Total: ${prices[selectedType].full.toLocaleString()}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${
                  selectedPlan === 'installments' ? 'border-blue-900 bg-blue-900' : 'border-gray-300'
                }`}>
                  {selectedPlan === 'installments' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code (optional)
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Order Summary */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {selectedType === 'simplified' ? 'Simplified Probate' : 'Full Probate'}
                  </span>
                  <span className="font-medium">${totalPrice.toLocaleString()}</span>
                </div>
                {selectedPlan === 'installments' && (
                  <div className="flex justify-between text-blue-900">
                    <span>Payment plan (3 payments)</span>
                    <span>${prices[selectedType].installment.toLocaleString()}/mo</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>{selectedPlan === 'installments' ? 'Due Today' : 'Total'}</span>
                    <span className="text-blue-900">
                      ${selectedPlan === 'installments'
                        ? prices[selectedType].installment.toLocaleString()
                        : totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full mt-6 bg-blue-900 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  {selectedPlan === 'installments'
                    ? `Pay $${prices[selectedType].installment.toLocaleString()} Now`
                    : `Pay $${totalPrice.toLocaleString()}`
                  }
                </>
              )}
            </button>

            {/* Security Badge */}
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              <Shield className="h-4 w-4 mr-2" />
              Secure payment powered by Stripe
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            What's Included in Your Service
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Attorney-supervised process</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">All court filings prepared</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Inventory & appraisal documents</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Creditor notice handling</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Final accounting preparation</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Distribution petition</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Email & phone support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Online case tracking</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 text-center text-gray-600">
          <p className="flex items-center justify-center">
            <Phone className="h-4 w-4 mr-2" />
            Questions? Call us at <a href="tel:818-291-6217" className="text-blue-900 font-medium ml-1">(818) 291-6217</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
