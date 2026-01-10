import React, { useState } from 'react';
import { CreditCard, Check, Shield, Clock, CheckCircle, Loader2 } from 'lucide-react';

const PaymentStep = ({ formData, onSubmitCase, isSubmitting }) => {
  const [selectedPlan, setSelectedPlan] = useState('full');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Calculate estate value for display
  const calculateEstateValue = () => {
    let total = 0;

    // Real property
    formData.assets?.realProperty?.forEach(prop => {
      total += parseFloat(prop.estimatedValue) || 0;
    });

    // Bank accounts
    formData.assets?.bankAccounts?.forEach(acc => {
      total += parseFloat(acc.balance) || 0;
    });

    // Investments
    formData.assets?.investments?.forEach(inv => {
      total += parseFloat(inv.value) || 0;
    });

    // Vehicles
    formData.assets?.vehicles?.forEach(v => {
      total += parseFloat(v.estimatedValue) || 0;
    });

    return total;
  };

  const estateValue = calculateEstateValue();
  const decedentName = `${formData.decedent?.firstName || ''} ${formData.decedent?.lastName || ''}`.trim();

  // Payment options
  const paymentOptions = [
    {
      id: 'full',
      label: 'Full Payment',
      amount: 3995,
      description: 'One-time payment - Best value',
      savings: '$205 savings vs. payment plan'
    },
    {
      id: 'payment_plan',
      label: '3-Payment Plan',
      amount: 1400,
      totalAmount: 4200,
      description: '3 payments of $1,400 each',
      note: 'First payment due now, then monthly'
    }
  ];

  const selectedOption = paymentOptions.find(p => p.id === selectedPlan);

  const handleSubmit = () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions to proceed.');
      return;
    }
    // Call the parent's submit function with payment info
    onSubmitCase({
      paymentPlan: selectedPlan,
      paymentAmount: selectedOption?.amount,
      totalAmount: selectedOption?.totalAmount || selectedOption?.amount
    });
  };

  return (
    <div className="space-y-6">
      {/* Case Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Estate of</p>
            <p className="font-medium text-gray-900">{decedentName || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500">County</p>
            <p className="font-medium text-gray-900">{formData.decedent?.lastAddress?.county || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500">Petitioner</p>
            <p className="font-medium text-gray-900">
              {formData.petitioner?.firstName} {formData.petitioner?.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Estimated Estate Value</p>
            <p className="font-medium text-gray-900">
              ${estateValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          What's Included in Your Probate Service
        </h3>
        <ul className="space-y-2">
          {[
            'Complete case management from start to finish',
            'All California probate forms prepared for you',
            'Court filing coordination',
            'Publication in approved newspaper',
            'Creditor notification management',
            'Inventory and appraisal guidance',
            'Final distribution preparation',
            'Attorney review at key milestones',
            'Unlimited support via messaging',
            'Secure document storage'
          ].map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-blue-800">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Plan Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Payment Option</h4>
        <div className="space-y-3">
          {paymentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedPlan(option.id)}
              className={`w-full p-4 border rounded-lg text-left transition-all ${
                selectedPlan === option.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  {option.savings && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      {option.savings}
                    </p>
                  )}
                  {option.note && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {option.note}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${option.amount.toLocaleString()}
                  </p>
                  {option.totalAmount && (
                    <p className="text-xs text-gray-500">
                      Total: ${option.totalAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">Accepted Payment Methods</span>
        </div>
        <p className="text-sm text-gray-600">
          Credit Card, Debit Card, Apple Pay, Google Pay
        </p>
      </div>

      {/* Terms Agreement */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-5 w-5 text-blue-600 rounded mt-0.5 mr-3"
          />
          <span className="text-sm text-gray-700">
            I agree to the <a href="#" className="text-blue-600 underline">Terms of Service</a> and
            <a href="#" className="text-blue-600 underline"> Privacy Policy</a>. I understand that
            this is a legal service for California probate matters and that results may vary
            based on individual circumstances.
          </span>
        </label>
      </div>

      {/* Total */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-gray-900">
            {selectedPlan === 'full' ? 'Total Due Today' : 'First Payment Due Today'}
          </span>
          <span className="text-2xl font-bold text-blue-900">
            ${selectedOption?.amount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !agreedToTerms}
        className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
          isSubmitting || !agreedToTerms
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Pay ${selectedOption?.amount.toLocaleString()} & Submit Case
          </>
        )}
      </button>

      {/* Security Badges */}
      <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 pt-2">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 mr-1" />
          <span>Powered by Stripe</span>
        </div>
      </div>

      {/* Refund Policy */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Full refund available within 7 days if no forms have been filed.
          <br />
          Questions? Call (818) 291-6217
        </p>
      </div>
    </div>
  );
};

export default PaymentStep;
