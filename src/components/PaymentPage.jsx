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
  AlertCircle,
  Calculator,
  FileSpreadsheet,
  Plus,
  Star
} from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();

  // Service type: 'simplified', 'full', or 'accounting_only'
  const [serviceType, setServiceType] = useState('full');
  // Accounting add-on: null, 'simple', or 'complex'
  const [accountingAddon, setAccountingAddon] = useState(null);
  // Payment plan: 'full' or 'installments'
  const [selectedPlan, setSelectedPlan] = useState('full');
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      setCanceled(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/payment' } });
    }
  }, [user, authLoading, navigate]);

  // Pricing structure
  const prices = {
    probate: {
      simplified: 2495,
      full: 3995,
    },
    accounting: {
      simple: 995,
      complex: 1995,
    },
  };

  // Calculate total price
  const calculateTotal = () => {
    let total = 0;

    if (serviceType === 'accounting_only') {
      // Accounting only - must have an accounting selection
      if (accountingAddon === 'simple') total = prices.accounting.simple;
      else if (accountingAddon === 'complex') total = prices.accounting.complex;
    } else {
      // Probate service
      total = prices.probate[serviceType] || 0;
      // Add accounting add-on if selected
      if (accountingAddon === 'simple') total += prices.accounting.simple;
      else if (accountingAddon === 'complex') total += prices.accounting.complex;
    }

    return total;
  };

  const totalPrice = calculateTotal();
  const installmentPrice = Math.ceil(totalPrice / 3);

  // Handle service type change
  const handleServiceTypeChange = (type) => {
    setServiceType(type);
    // If switching to accounting_only and no accounting selected, default to simple
    if (type === 'accounting_only' && !accountingAddon) {
      setAccountingAddon('simple');
    }
    // If switching from accounting_only to probate, clear accounting selection
    if (type !== 'accounting_only' && serviceType === 'accounting_only') {
      setAccountingAddon(null);
    }
  };

  // Toggle accounting add-on
  const toggleAccountingAddon = (type) => {
    if (serviceType === 'accounting_only') {
      // For accounting only, must have one selected
      setAccountingAddon(type);
    } else {
      // For probate, toggle the add-on
      setAccountingAddon(accountingAddon === type ? null : type);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login', { state: { from: '/payment' } });
      return;
    }

    // Validate accounting_only has a selection
    if (serviceType === 'accounting_only' && !accountingAddon) {
      setError('Please select an accounting service.');
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
          serviceType: serviceType,
          probateType: serviceType === 'accounting_only' ? null : serviceType,
          accountingAddon: accountingAddon,
          paymentPlan: selectedPlan,
          customerEmail: user.email,
          caseId: '',
          promoCode: promoCode.trim() || null,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError('Server error. Please try again or contact us at (818) 291-6217.');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        console.error('API error:', response.status, data);
        setError(data.error || `Server error (${response.status}). Please contact us at (818) 291-6217.`);
        setIsLoading(false);
        return;
      }

      if (data.url && typeof data.url === 'string' && data.url.startsWith('http')) {
        window.location.href = data.url;
      } else {
        console.error('Invalid checkout URL:', data);
        setError(data.error || 'Failed to create checkout session. Please contact us at (818) 291-6217.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Network error. Please check your connection and try again, or contact us at (818) 291-6217.');
      setIsLoading(false);
    }
  };

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
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Payment
          </h1>
          <p className="text-gray-600">
            Select your services and payment option below
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
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Service Type Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-blue-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
            Select Your Service
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Simplified Probate */}
            <div
              onClick={() => handleServiceTypeChange('simplified')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                serviceType === 'simplified'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-bold text-gray-900">Simplified Probate</h3>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  serviceType === 'simplified' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {serviceType === 'simplified' && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                For primary residences under $750,000
              </p>
              <p className="text-2xl font-bold text-green-600">${prices.probate.simplified.toLocaleString()}</p>
              <p className="text-xs text-gray-500">or 3 payments of ${Math.ceil(prices.probate.simplified / 3).toLocaleString()}</p>
            </div>

            {/* Full Probate */}
            <div
              onClick={() => handleServiceTypeChange('full')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative ${
                serviceType === 'full'
                  ? 'border-blue-900 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="absolute -top-3 left-4">
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  MOST COMMON
                </span>
              </div>
              <div className="flex items-start justify-between mb-2 mt-1">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-blue-900 mr-2" />
                  <h3 className="font-bold text-gray-900">Full Probate</h3>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  serviceType === 'full' ? 'border-blue-900 bg-blue-900' : 'border-gray-300'
                }`}>
                  {serviceType === 'full' && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                For all estates requiring formal probate
              </p>
              <p className="text-2xl font-bold text-blue-900">${prices.probate.full.toLocaleString()}</p>
              <p className="text-xs text-gray-500">or 3 payments of ${Math.ceil(prices.probate.full / 3).toLocaleString()}</p>
            </div>

            {/* Accounting Only */}
            <div
              onClick={() => handleServiceTypeChange('accounting_only')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                serviceType === 'accounting_only'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Calculator className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-bold text-gray-900">Accounting Only</h3>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  serviceType === 'accounting_only' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                }`}>
                  {serviceType === 'accounting_only' && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Probate accounting without full service
              </p>
              <p className="text-2xl font-bold text-purple-600">From ${prices.accounting.simple.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Select accounting type below</p>
            </div>
          </div>
        </div>

        {/* Step 2: Accounting Add-ons (or required selection for accounting_only) */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="bg-blue-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
            {serviceType === 'accounting_only' ? 'Select Accounting Service' : 'Optional Add-On: Accounting Services'}
          </h2>
          {serviceType !== 'accounting_only' && (
            <p className="text-gray-600 text-sm mb-4 ml-10">
              Need help with probate accounting? Add it to your order.
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Simple Accounting */}
            <div
              onClick={() => toggleAccountingAddon('simple')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                accountingAddon === 'simple'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-bold text-gray-900">Simple Accounting</h3>
                </div>
                <div className="flex items-center">
                  <span className="text-xl font-bold text-purple-600 mr-3">
                    {serviceType === 'accounting_only' ? '' : '+'} ${prices.accounting.simple.toLocaleString()}
                  </span>
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    accountingAddon === 'simple' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}>
                    {accountingAddon === 'simple' && <Check className="h-4 w-4 text-white" />}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 font-medium mb-2">Best for estates with:</p>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                  Under 50 transactions
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                  Basic income (interest, dividends)
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                  Single property sale
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                  Straightforward distribution
                </li>
              </ul>

              <div className="border-t pt-3">
                <p className="text-sm text-gray-700 font-medium mb-2">Includes:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    Court-formatted accounting document
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    Income & expense summary
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    Proposed distribution schedule
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    Attorney review
                  </li>
                </ul>
              </div>
            </div>

            {/* Complex Accounting */}
            <div
              onClick={() => toggleAccountingAddon('complex')}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative ${
                accountingAddon === 'complex'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {serviceType === 'full' && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    POPULAR
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <Calculator className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-bold text-gray-900">Complex Accounting</h3>
                </div>
                <div className="flex items-center">
                  <span className="text-xl font-bold text-purple-600 mr-3">
                    {serviceType === 'accounting_only' ? '' : '+'} ${prices.accounting.complex.toLocaleString()}
                  </span>
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    accountingAddon === 'complex' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}>
                    {accountingAddon === 'complex' && <Check className="h-4 w-4 text-white" />}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 font-medium mb-2">Best for estates with:</p>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                  50+ transactions
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                  Business income/expenses
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                  Multiple properties or rental income
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                  Multi-year accounting
                </li>
              </ul>

              <div className="border-t pt-3">
                <p className="text-sm text-gray-700 font-medium mb-2">Includes everything in Simple, PLUS:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <Plus className="h-3 w-3 text-purple-500 mr-2 flex-shrink-0" />
                    Multiple property transaction tracking
                  </li>
                  <li className="flex items-center">
                    <Plus className="h-3 w-3 text-purple-500 mr-2 flex-shrink-0" />
                    Business income reconciliation
                  </li>
                  <li className="flex items-center">
                    <Plus className="h-3 w-3 text-purple-500 mr-2 flex-shrink-0" />
                    Rental property accounting
                  </li>
                  <li className="flex items-center">
                    <Plus className="h-3 w-3 text-purple-500 mr-2 flex-shrink-0" />
                    Tax allocation calculations
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Skip accounting message for probate */}
          {serviceType !== 'accounting_only' && !accountingAddon && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              No accounting add-on selected. You can add this later if needed.
            </p>
          )}
        </div>

        {/* Step 3: Payment Options & Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Options */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
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
                    ${totalPrice.toLocaleString()}
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
                    ${installmentPrice.toLocaleString()}/mo
                  </p>
                  <p className="text-xs text-gray-500">
                    Total: ${totalPrice.toLocaleString()}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${
                  selectedPlan === 'installments' ? 'border-blue-900 bg-blue-900' : 'border-gray-300'
                }`}>
                  {selectedPlan === 'installments' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
            </div>

            {/* Klarna Info */}
            <div className="mt-4 bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="font-bold text-lg" style={{color: '#FFB3C7'}}>Klarna</span>
                <span className="ml-2 bg-pink-100 text-pink-700 text-xs font-medium px-2 py-0.5 rounded">Buy now, pay later</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>4 interest-free payments</strong> of ${Math.ceil(totalPrice / 4).toLocaleString()} available at checkout
              </p>
              <p className="text-xs text-gray-500">
                Select "Pay in Full" above, then choose Klarna on the next screen. Instant approval, no impact to credit score.
              </p>
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
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              {/* Service */}
              {serviceType !== 'accounting_only' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {serviceType === 'simplified' ? 'Simplified Probate' : 'Full Probate'}
                  </span>
                  <span className="font-medium">${prices.probate[serviceType].toLocaleString()}</span>
                </div>
              )}

              {/* Accounting Add-on */}
              {accountingAddon && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {accountingAddon === 'simple' ? 'Simple Accounting' : 'Complex Accounting'}
                    {serviceType !== 'accounting_only' && ' (Add-on)'}
                  </span>
                  <span className="font-medium">
                    {serviceType !== 'accounting_only' && '+'}${prices.accounting[accountingAddon].toLocaleString()}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-900">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Installment breakdown */}
              {selectedPlan === 'installments' && (
                <div className="bg-blue-50 rounded-lg p-3 mt-3">
                  <div className="flex justify-between text-blue-900">
                    <span className="font-medium">Due today</span>
                    <span className="font-bold">${installmentPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    + 2 more payments of ${installmentPrice.toLocaleString()}/month
                  </p>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={isLoading || (serviceType === 'accounting_only' && !accountingAddon)}
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
                    ? `Pay $${installmentPrice.toLocaleString()} Now`
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
        {serviceType !== 'accounting_only' && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              What's Included in Your Probate Service
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
        )}

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
