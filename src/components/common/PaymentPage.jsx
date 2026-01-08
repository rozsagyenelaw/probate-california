import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Scale, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import StripePayment from './StripePayment';

const PaymentPage = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  // Check for payment success from Stripe redirect
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const success = searchParams.get('success');
      const sessionId = searchParams.get('session_id');

      if (success === 'true' && sessionId) {
        // Payment was successful - update user record
        try {
          if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
              paymentStatus: 'paid',
              paymentDate: serverTimestamp(),
              stripeSessionId: sessionId,
              updatedAt: serverTimestamp()
            });
            setPaymentStatus('success');
          }
        } catch (error) {
          console.error('Error updating payment status:', error);
        }
      } else if (success === 'false') {
        setPaymentStatus('cancelled');
      } else {
        // Check if user already paid
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().paymentStatus === 'paid') {
            setPaymentStatus('already_paid');
          }
        }
      }
      setLoading(false);
    };

    checkPaymentStatus();
  }, [searchParams, user]);

  const handlePaymentComplete = () => {
    // This would be called after successful payment
    navigate('/intake');
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

  // Success view
  if (paymentStatus === 'success' || paymentStatus === 'already_paid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Already Completed'}
          </h2>
          <p className="text-gray-600 mb-8">
            {paymentStatus === 'success'
              ? "Thank you for your payment. You can now begin your probate case."
              : "Your payment has already been processed. You can continue with your case."}
          </p>
          <button
            onClick={() => navigate('/intake')}
            className="w-full py-3 px-4 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium"
          >
            Start Your Probate Case
          </button>
        </div>
      </div>
    );
  }

  // Cancelled view
  if (paymentStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h2>
          <p className="text-gray-600 mb-8">
            No worries! Your payment was not processed.
            You can try again when you're ready.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentStatus('pending')}
              className="w-full py-3 px-4 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment form view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <div className="bg-blue-900 p-2 rounded-lg mr-3">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Complete Your Purchase</h1>
                <p className="text-sm text-gray-500">California Probate Service</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* User Info */}
          {userProfile && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-500">Purchasing for:</p>
              <p className="font-medium text-gray-900">
                {userProfile.firstName} {userProfile.lastName}
              </p>
              <p className="text-sm text-gray-600">{userProfile.email || user?.email}</p>
            </div>
          )}

          {/* Stripe Payment Component */}
          <StripePayment onPaymentComplete={handlePaymentComplete} />
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-900">15+</p>
            <p className="text-sm text-gray-600">Years Experience</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-900">500+</p>
            <p className="text-sm text-gray-600">Cases Completed</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-900">5 Star</p>
            <p className="text-sm text-gray-600">Client Reviews</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
