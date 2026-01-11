import React, { useState, useMemo } from 'react';
import { CreditCard, Check, Shield, Clock, CheckCircle, Loader2, Home, Building2, AlertCircle, Star, Calculator, FileSpreadsheet, Plus } from 'lucide-react';

const PaymentStep = ({ formData, onSubmitCase, isSubmitting }) => {
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState('full');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [accountingAddon, setAccountingAddon] = useState(null); // null, 'simple', 'complex'

  // Calculate estate values for qualification
  const estateAnalysis = useMemo(() => {
    let primaryResidenceValue = 0;
    let otherRealEstateValue = 0;
    let otherRealEstateCount = 0;
    let personalPropertyTotal = 0;

    // Analyze real property - look for propertyType field
    formData.assets?.realProperty?.forEach((prop) => {
      const value = parseFloat(prop.estimatedValue) || 0;
      // Check if this is the primary residence
      if (prop.propertyType === 'primary_residence' || prop.isPrimaryResidence) {
        primaryResidenceValue = value;
      } else {
        otherRealEstateValue += value;
        otherRealEstateCount++;
      }
    });

    // Calculate personal property (bank accounts, investments, vehicles, other)
    formData.assets?.bankAccounts?.forEach(acc => {
      personalPropertyTotal += parseFloat(acc.balance) || 0;
    });

    formData.assets?.investments?.forEach(inv => {
      personalPropertyTotal += parseFloat(inv.value) || 0;
    });

    formData.assets?.vehicles?.forEach(v => {
      personalPropertyTotal += parseFloat(v.estimatedValue) || 0;
    });

    formData.assets?.otherAssets?.forEach(asset => {
      personalPropertyTotal += parseFloat(asset.value) || 0;
    });

    // Determine qualification for simplified probate
    const qualifiesForSimplified =
      primaryResidenceValue < 750000 &&
      otherRealEstateCount === 0 &&
      personalPropertyTotal < 208850;

    return {
      primaryResidenceValue,
      otherRealEstateValue,
      otherRealEstateCount,
      personalPropertyTotal,
      totalEstateValue: primaryResidenceValue + otherRealEstateValue + personalPropertyTotal,
      qualifiesForSimplified,
      reasons: qualifiesForSimplified ? [] : [
        primaryResidenceValue >= 750000 ? `Primary residence value ($${primaryResidenceValue.toLocaleString()}) exceeds $750,000` : null,
        otherRealEstateCount > 0 ? `Estate includes ${otherRealEstateCount} additional real property` : null,
        personalPropertyTotal >= 208850 ? `Personal property ($${personalPropertyTotal.toLocaleString()}) exceeds $208,850 threshold` : null,
      ].filter(Boolean)
    };
  }, [formData.assets]);

  // Probate type selection - default to recommended
  const [selectedProbateType, setSelectedProbateType] = useState(
    estateAnalysis.qualifiesForSimplified ? 'simplified' : 'full'
  );

  const decedentName = `${formData.decedent?.firstName || ''} ${formData.decedent?.lastName || ''}`.trim();

  // Pricing for each probate type and accounting
  const probatePricing = {
    simplified: { price: 2495, installment: 832 },
    full: { price: 3995, installment: 1332 }
  };

  const accountingPricing = {
    simple: { price: 995, label: 'Simple Accounting' },
    complex: { price: 1995, label: 'Complex Accounting' }
  };

  // Calculate total with accounting add-on
  const calculateTotal = () => {
    let total = probatePricing[selectedProbateType].price;
    if (accountingAddon) {
      total += accountingPricing[accountingAddon].price;
    }
    return total;
  };

  const totalPrice = calculateTotal();
  const installmentPrice = Math.ceil(totalPrice / 3);

  const handleSubmit = () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions to proceed.');
      return;
    }
    console.log('PaymentStep: Submitting with payment info...');
    // Call the parent's submit function with payment info
    onSubmitCase({
      probateType: selectedProbateType,
      accountingAddon: accountingAddon,
      paymentPlan: selectedPaymentPlan,
      paymentAmount: selectedPaymentPlan === 'full' ? totalPrice : installmentPrice,
      totalAmount: totalPrice
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
              ${estateAnalysis.totalEstateValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Probate Type Recommendation */}
      <div className={`border-2 rounded-lg p-6 ${
        estateAnalysis.qualifiesForSimplified
          ? 'bg-green-50 border-green-300'
          : 'bg-blue-50 border-blue-300'
      }`}>
        <div className="flex items-start">
          <div className={`p-2 rounded-full mr-4 ${
            estateAnalysis.qualifiesForSimplified ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {estateAnalysis.qualifiesForSimplified ? (
              <Home className="h-6 w-6 text-green-600" />
            ) : (
              <Building2 className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className={`text-lg font-bold ${
                estateAnalysis.qualifiesForSimplified ? 'text-green-800' : 'text-blue-800'
              }`}>
                {estateAnalysis.qualifiesForSimplified
                  ? 'You Qualify for Simplified Probate!'
                  : 'Full Probate Recommended'}
              </h3>
              <span className={`ml-3 px-2 py-1 text-xs font-bold rounded-full ${
                estateAnalysis.qualifiesForSimplified
                  ? 'bg-green-200 text-green-800'
                  : 'bg-blue-200 text-blue-800'
              }`}>
                RECOMMENDED
              </span>
            </div>

            {estateAnalysis.qualifiesForSimplified ? (
              <div className="text-sm text-green-700">
                <p className="mb-2">Based on your answers, your estate qualifies for California's simplified probate process:</p>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Primary residence under $750,000 (${estateAnalysis.primaryResidenceValue.toLocaleString()})
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    No additional real estate
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Personal property under $208,850 (${estateAnalysis.personalPropertyTotal.toLocaleString()})
                  </li>
                </ul>
              </div>
            ) : (
              <div className="text-sm text-blue-700">
                <p className="mb-2">Based on your answers, your estate requires full probate:</p>
                <ul className="space-y-1">
                  {estateAnalysis.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Probate Type Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Probate Service</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Simplified Probate */}
          <button
            onClick={() => setSelectedProbateType('simplified')}
            disabled={!estateAnalysis.qualifiesForSimplified}
            className={`p-4 border-2 rounded-lg text-left transition-all relative ${
              selectedProbateType === 'simplified'
                ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                : estateAnalysis.qualifiesForSimplified
                  ? 'border-gray-200 hover:border-green-300'
                  : 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
            }`}
          >
            {estateAnalysis.qualifiesForSimplified && (
              <div className="absolute -top-3 right-4">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  BEST VALUE
                </span>
              </div>
            )}
            <div className="flex items-center mb-2">
              <Home className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-bold text-gray-900">Simplified Probate</h4>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-1">$2,495</p>
            <p className="text-xs text-gray-500 mb-3">or 3 payments of $832/mo</p>
            <p className="text-sm text-gray-600 mb-2">For primary residences under $750,000</p>
            {!estateAnalysis.qualifiesForSimplified && (
              <p className="text-xs text-red-600 mt-2">
                Your estate does not qualify for simplified probate
              </p>
            )}
          </button>

          {/* Full Probate */}
          <button
            onClick={() => setSelectedProbateType('full')}
            className={`p-4 border-2 rounded-lg text-left transition-all relative ${
              selectedProbateType === 'full'
                ? 'border-blue-900 bg-blue-50 ring-2 ring-blue-900'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {!estateAnalysis.qualifiesForSimplified && (
              <div className="absolute -top-3 right-4">
                <span className="bg-blue-900 text-white text-xs font-bold px-2 py-1 rounded-full">
                  RECOMMENDED
                </span>
              </div>
            )}
            <div className="flex items-center mb-2">
              <Building2 className="h-5 w-5 text-blue-900 mr-2" />
              <h4 className="font-bold text-gray-900">Full Probate</h4>
            </div>
            <p className="text-2xl font-bold text-blue-900 mb-1">$3,995</p>
            <p className="text-xs text-gray-500 mb-3">or 3 payments of $1,332/mo</p>
            <p className="text-sm text-gray-600">For all estates requiring formal probate</p>
          </button>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          What's Included in Your {selectedProbateType === 'simplified' ? 'Simplified' : 'Full'} Probate Service
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

      {/* Accounting Add-On Section */}
      <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
        <div className="flex items-center mb-4">
          <Calculator className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-purple-900">Optional Add-On: Probate Accounting</h3>
        </div>
        <p className="text-sm text-purple-700 mb-4">
          Need help with court-required probate accounting? Add professional accounting services to your order.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Simple Accounting */}
          <button
            type="button"
            onClick={() => setAccountingAddon(accountingAddon === 'simple' ? null : 'simple')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              accountingAddon === 'simple'
                ? 'border-purple-500 bg-white ring-2 ring-purple-500'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-bold text-gray-900">Simple Accounting</h4>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                accountingAddon === 'simple' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
              }`}>
                {accountingAddon === 'simple' && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
            <p className="text-xl font-bold text-purple-600 mb-2">+$995</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <Check className="h-3 w-3 text-gray-400 mr-1" />
                Under 50 transactions
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 text-gray-400 mr-1" />
                Basic income (interest, dividends)
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 text-gray-400 mr-1" />
                Single property sale
              </li>
            </ul>
          </button>

          {/* Complex Accounting */}
          <button
            type="button"
            onClick={() => setAccountingAddon(accountingAddon === 'complex' ? null : 'complex')}
            className={`p-4 border-2 rounded-lg text-left transition-all relative ${
              accountingAddon === 'complex'
                ? 'border-purple-500 bg-white ring-2 ring-purple-500'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            {selectedProbateType === 'full' && (
              <div className="absolute -top-3 right-4">
                <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  POPULAR
                </span>
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <Calculator className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-bold text-gray-900">Complex Accounting</h4>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                accountingAddon === 'complex' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
              }`}>
                {accountingAddon === 'complex' && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
            <p className="text-xl font-bold text-purple-600 mb-2">+$1,995</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <Plus className="h-3 w-3 text-purple-500 mr-1" />
                50+ transactions
              </li>
              <li className="flex items-center">
                <Plus className="h-3 w-3 text-purple-500 mr-1" />
                Business income/rental properties
              </li>
              <li className="flex items-center">
                <Plus className="h-3 w-3 text-purple-500 mr-1" />
                Multi-year accounting
              </li>
            </ul>
          </button>
        </div>

        {!accountingAddon && (
          <p className="text-xs text-purple-600 mt-3 text-center">
            No accounting add-on selected. You can add this later if needed.
          </p>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              {selectedProbateType === 'simplified' ? 'Simplified Probate' : 'Full Probate'}
            </span>
            <span className="font-medium">${probatePricing[selectedProbateType].price.toLocaleString()}</span>
          </div>
          {accountingAddon && (
            <div className="flex justify-between text-purple-700">
              <span>{accountingPricing[accountingAddon].label}</span>
              <span className="font-medium">+${accountingPricing[accountingAddon].price.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-blue-900">${totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Plan Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Payment Option</h4>
        <div className="space-y-3">
          <button
            onClick={() => setSelectedPaymentPlan('full')}
            className={`w-full p-4 border rounded-lg text-left transition-all ${
              selectedPaymentPlan === 'full'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">Pay in Full</p>
                <p className="text-sm text-gray-600 mt-1">One-time payment</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  ${totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPaymentPlan('installments')}
            className={`w-full p-4 border rounded-lg text-left transition-all ${
              selectedPaymentPlan === 'installments'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">3 Monthly Payments</p>
                <p className="text-sm text-gray-600 mt-1">No extra charge - same total price</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  First payment due now, then monthly
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  ${installmentPrice.toLocaleString()}/mo
                </p>
                <p className="text-xs text-gray-500">
                  Total: ${totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </button>
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
            {selectedPaymentPlan === 'full' ? 'Total Due Today' : 'First Payment Due Today'}
          </span>
          <span className="text-2xl font-bold text-blue-900">
            ${selectedPaymentPlan === 'full'
              ? totalPrice.toLocaleString()
              : installmentPrice.toLocaleString()}
          </span>
        </div>
        {selectedPaymentPlan === 'installments' && (
          <p className="text-sm text-gray-500 text-center">
            + 2 more payments of ${installmentPrice.toLocaleString()}/month
          </p>
        )}
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
            Pay ${selectedPaymentPlan === 'full'
              ? totalPrice.toLocaleString()
              : installmentPrice.toLocaleString()} & Submit Case
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
