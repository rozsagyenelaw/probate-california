import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Scale,
  ArrowLeft,
  Calculator,
  CheckCircle,
  Loader2
} from 'lucide-react';

const ACCOUNTING_PRICES = {
  simple: 995,
  complex: 1995
};

const RequestAccounting = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'simple');
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCase = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's current case ID
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().currentCaseId) {
          const caseDoc = await getDoc(doc(db, 'cases', userDoc.data().currentCaseId));
          if (caseDoc.exists()) {
            setProbateCase({ id: caseDoc.id, ...caseDoc.data() });
          }
        }
      } catch (err) {
        console.error('Error loading case:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [user]);

  const handlePurchase = async () => {
    if (!probateCase) {
      setError('No active case found. Please contact support.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create Stripe checkout session for accounting addon
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType: 'accounting_addon',
          accountingAddon: selectedType,
          paymentPlan: 'full',
          customerEmail: user.email,
          caseId: probateCase.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Invalid checkout URL');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError(err.message || 'Failed to process request. Please contact us at (818) 291-6217.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Already has accounting
  if (probateCase?.addOns?.accounting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accounting Already Included</h1>
            <p className="text-gray-600 mb-6">
              Your case already includes {probateCase.addOns.accounting === 'complex' ? 'Complex' : 'Simple'} Accounting services.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="flex items-center">
              <div className="bg-blue-900 p-2 rounded-lg mr-2">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">California Probate</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Accounting Services</h1>
          <p className="text-gray-600">
            Professional probate accounting to help you manage the estate finances and prepare required court reports.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Accounting Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Simple Accounting */}
          <div
            onClick={() => setSelectedType('simple')}
            className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all ${
              selectedType === 'simple'
                ? 'ring-2 ring-green-500 border-green-500'
                : 'border border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedType === 'simple'
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300'
              }`}>
                {selectedType === 'simple' && (
                  <CheckCircle className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Simple Accounting</h3>
            <p className="text-3xl font-bold text-green-600 mb-4">$995</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Basic estate inventory tracking
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Income and expense ledger
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Final accounting report for court
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Ideal for estates under $500K
              </li>
            </ul>
          </div>

          {/* Complex Accounting */}
          <div
            onClick={() => setSelectedType('complex')}
            className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all ${
              selectedType === 'complex'
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'border border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedType === 'complex'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedType === 'complex' && (
                  <CheckCircle className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Complex Accounting</h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">$1,995</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                Comprehensive asset tracking
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                Multiple property/account management
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                Detailed final accounting with exhibits
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                Ideal for estates over $500K
              </li>
            </ul>
          </div>
        </div>

        {/* Purchase Button */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Selected Service</p>
              <p className="font-semibold text-gray-900">
                {selectedType === 'complex' ? 'Complex' : 'Simple'} Accounting
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ${ACCOUNTING_PRICES[selectedType].toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={submitting || !probateCase}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
              submitting || !probateCase
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </span>
            ) : (
              `Purchase ${selectedType === 'complex' ? 'Complex' : 'Simple'} Accounting`
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by Stripe. You'll be redirected to complete payment.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Have questions about which option is right for you?</p>
          <p className="text-gray-900">
            Call us at{' '}
            <a href="tel:+18182916217" className="text-blue-900 font-medium hover:underline">
              (818) 291-6217
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RequestAccounting;
