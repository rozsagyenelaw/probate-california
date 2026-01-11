import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { CA_COUNTY_LIST } from '../../data/californiaCourts';
import {
  Scale,
  ArrowLeft,
  Gavel,
  Video,
  Users,
  CheckCircle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';

const COURT_PRICES = {
  remote: 500,
  contested: 600
};

const HEARING_TYPES = [
  { value: 'petition_hearing', label: 'Petition for Probate Hearing' },
  { value: 'inventory_hearing', label: 'Inventory Hearing' },
  { value: 'accounting_hearing', label: 'Accounting Hearing' },
  { value: 'final_distribution', label: 'Final Distribution Hearing' },
  { value: 'status_conference', label: 'Status Conference' },
  { value: 'motion_hearing', label: 'Motion Hearing' },
  { value: 'other', label: 'Other' }
];

const RequestCourtAppearance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'remote');
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Hearing details form
  const [hearingDetails, setHearingDetails] = useState({
    caseNumber: '',
    county: '',
    hearingDate: '',
    hearingTime: '',
    department: '',
    hearingType: '',
    otherDescription: ''
  });

  useEffect(() => {
    const loadCase = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().currentCaseId) {
          const caseDoc = await getDoc(doc(db, 'cases', userDoc.data().currentCaseId));
          if (caseDoc.exists()) {
            const caseData = { id: caseDoc.id, ...caseDoc.data() };
            setProbateCase(caseData);
            // Pre-fill county from case if available
            if (caseData.decedent?.lastAddress?.county) {
              setHearingDetails(prev => ({
                ...prev,
                county: caseData.decedent.lastAddress.county
              }));
            }
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

  // Calculate minimum hearing date (7 days from today)
  const getMinHearingDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const isFormValid = () => {
    return (
      hearingDetails.county &&
      hearingDetails.hearingDate &&
      hearingDetails.hearingTime &&
      hearingDetails.hearingType &&
      (hearingDetails.hearingType !== 'other' || hearingDetails.otherDescription)
    );
  };

  const handlePurchase = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required hearing details.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType: 'court_appearance',
          courtAppearance: selectedType,
          paymentPlan: 'full',
          customerEmail: user.email,
          caseId: probateCase?.id || '',
          hearingDetails: hearingDetails
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Court Appearance</h1>
          <p className="text-gray-600">
            Our attorney will appear at your court hearing on your behalf.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Appearance Type Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Remote Appearance */}
          <div
            onClick={() => setSelectedType('remote')}
            className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all ${
              selectedType === 'remote'
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'border border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedType === 'remote'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedType === 'remote' && (
                  <CheckCircle className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Remote Appearance</h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">$500</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                Standard probate hearings
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                Attorney appears via CourtCall/Zoom
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                Follow-up summary provided
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                Best for routine hearings
              </li>
            </ul>
          </div>

          {/* Contested/Complex Appearance */}
          <div
            onClick={() => setSelectedType('contested')}
            className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all ${
              selectedType === 'contested'
                ? 'ring-2 ring-purple-500 border-purple-500'
                : 'border border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedType === 'contested'
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {selectedType === 'contested' && (
                  <CheckCircle className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Contested/Complex</h3>
            <p className="text-3xl font-bold text-purple-600 mb-4">$600</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                2-hour minimum representation
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                Contested matters or objections
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                In-person or remote appearance
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                Pre-hearing strategy call included
              </li>
            </ul>
          </div>
        </div>

        {/* Hearing Details Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Gavel className="h-5 w-5 mr-2 text-blue-600" />
            Hearing Details
          </h3>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Case Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case Number (if known)
                </label>
                <input
                  type="text"
                  value={hearingDetails.caseNumber}
                  onChange={(e) => setHearingDetails(prev => ({ ...prev, caseNumber: e.target.value }))}
                  placeholder="e.g., BP123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* County */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  County <span className="text-red-500">*</span>
                </label>
                <select
                  value={hearingDetails.county}
                  onChange={(e) => setHearingDetails(prev => ({ ...prev, county: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select county</option>
                  {CA_COUNTY_LIST.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Hearing Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Hearing Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={hearingDetails.hearingDate}
                  onChange={(e) => setHearingDetails(prev => ({ ...prev, hearingDate: e.target.value }))}
                  min={getMinHearingDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 7 days from today</p>
              </div>

              {/* Hearing Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Hearing Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={hearingDetails.hearingTime}
                  onChange={(e) => setHearingDetails(prev => ({ ...prev, hearingTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Department/Courtroom
                </label>
                <input
                  type="text"
                  value={hearingDetails.department}
                  onChange={(e) => setHearingDetails(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Dept. 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Hearing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hearing Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={hearingDetails.hearingType}
                  onChange={(e) => setHearingDetails(prev => ({ ...prev, hearingType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select hearing type</option>
                  {HEARING_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {hearingDetails.hearingType === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please describe the hearing <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hearingDetails.otherDescription}
                  onChange={(e) => setHearingDetails(prev => ({ ...prev, otherDescription: e.target.value }))}
                  placeholder="Describe the type of hearing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Purchase Button */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Selected Service</p>
              <p className="font-semibold text-gray-900">
                {selectedType === 'contested' ? 'Contested/Complex' : 'Remote'} Court Appearance
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ${COURT_PRICES[selectedType].toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={submitting || !isFormValid()}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
              submitting || !isFormValid()
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
              `Request ${selectedType === 'contested' ? 'Contested/Complex' : 'Remote'} Appearance`
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by Stripe. You'll be redirected to complete payment.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Have questions about court appearances?</p>
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

export default RequestCourtAppearance;
