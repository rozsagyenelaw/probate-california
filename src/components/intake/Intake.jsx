import React, { useState, useEffect } from 'react';
import { trackLead } from '../../services/analytics';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { INTAKE_STEPS, INITIAL_FORM_STATE } from './IntakeSteps';
import { getCourtByCounty } from '../../data/californiaCourts';

// Step Components
import DecedentStep from './steps/DecedentStep';
import PetitionerStep from './steps/PetitionerStep';
import WillStep from './steps/WillStep';
import HeirsStep from './steps/HeirsStep';
import RealPropertyStep from './steps/RealPropertyStep';
import FinancialStep from './steps/FinancialStep';
import VehiclesPersonalStep from './steps/VehiclesPersonalStep';
import LiabilitiesStep from './steps/LiabilitiesStep';
import DocumentsStep from './steps/DocumentsStep';
import ReviewStep from './steps/ReviewStep';
import PaymentStep from './steps/PaymentStep';

const Intake = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined' && user?.uid) {
      const savedData = localStorage.getItem(`intake-${user.uid}`);
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error('Error loading saved form data:', e);
        }
      }
    }
    return INITIAL_FORM_STATE;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // A client who already paid finishes intake without a payment step (item 17)
  const [paidCase, setPaidCase] = useState(null);

  useEffect(() => {
    if (!user) return;
    let on = true;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'cases'), where('userId', '==', user.uid)));
        const paid = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(c => !c.archived && (['paid', 'installments_active'].includes(c.paymentStatus) || c.payment?.status === 'paid'));
        if (on && paid.length) setPaidCase(paid.find(c => !c.intakeCompletedAt) || paid[0]);
      } catch (e) { console.warn('Intake: could not check payment status', e.code || e.message); }
    })();
    return () => { on = false; };
  }, [user]);

  // Save form data to localStorage on changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`intake-${user.uid}`, JSON.stringify(formData));
    }
  }, [formData, user]);

  const updateFormData = (data) => {
    setFormData((prev) => ({
      ...prev,
      ...data
    }));
  };

  const progress = ((currentStep + 1) / INTAKE_STEPS.length) * 100;

  const getMissingFields = () => {
    const step = INTAKE_STEPS[currentStep];
    const missing = [];

    switch (step.id) {
      case 'decedent':
        if (!formData.decedent.firstName) missing.push('First Name');
        if (!formData.decedent.lastName) missing.push('Last Name');
        if (!formData.decedent.dateOfDeath) missing.push('Date of Death');
        if (!formData.decedent.lastAddress.street) missing.push('Street Address');
        if (!formData.decedent.lastAddress.city) missing.push('City');
        if (!formData.decedent.lastAddress.county) missing.push('County');
        if (!formData.decedent.maritalStatus) missing.push('Marital Status');
        break;

      case 'petitioner':
        if (!formData.petitioner.firstName) missing.push('First Name');
        if (!formData.petitioner.lastName) missing.push('Last Name');
        if (!formData.petitioner.relationship) missing.push('Relationship');
        if (!formData.petitioner.phone) missing.push('Phone');
        if (!formData.petitioner.email) missing.push('Email');
        if (!formData.petitioner.address.street) missing.push('Street Address');
        if (!formData.petitioner.address.city) missing.push('City');
        if (!formData.petitioner.address.zip) missing.push('ZIP Code');
        break;

      case 'will':
        if (formData.willExists === null) missing.push('Will exists (Yes/No)');
        if (formData.willExists === true) {
          if (!formData.willDate) missing.push('Will Date');
          if (!formData.namedExecutor) missing.push('Named Executor');
          if (formData.bondWaivedInWill === null) missing.push('Bond Waived');
        }
        break;

      case 'heirs':
        if (formData.heirs.length === 0) missing.push('At least one heir');
        break;

      default:
        break;
    }
    return missing;
  };

  const canProceed = () => {
    return getMissingFields().length === 0;
  };

  const handleNext = () => {
    if (currentStep < INTAKE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleEditStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    window.scrollTo(0, 0);
  };

  const renderStep = () => {
    const step = INTAKE_STEPS[currentStep];
    const props = { formData, updateFormData };

    switch (step.id) {
      case 'decedent':
        return <DecedentStep {...props} />;
      case 'petitioner':
        return <PetitionerStep {...props} />;
      case 'will':
        return <WillStep {...props} />;
      case 'heirs':
        return <HeirsStep {...props} />;
      case 'realProperty':
        return <RealPropertyStep {...props} />;
      case 'financial':
        return <FinancialStep {...props} />;
      case 'vehiclesPersonal':
        return <VehiclesPersonalStep {...props} />;
      case 'liabilities':
        return <LiabilitiesStep {...props} />;
      case 'documents':
        return <DocumentsStep {...props} />;
      case 'review':
        return <ReviewStep {...props} onEditStep={handleEditStep} />;
      case 'payment':
        return <PaymentStep {...props} onSubmitCase={handleSubmitWithPayment} isSubmitting={isSubmitting} paidCase={paidCase} />;
      default:
        return null;
    }
  };

  // Submit: the server attaches the answers to the client's paid case (no second payment), or opens
  // one case and starts the fee checkout when nothing is paid yet (netlify/functions/submit-intake.js).
  const handleSubmitWithPayment = async (paymentInfo) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const filingCounty = formData.decedent.lastAddress.county;
      const courtInfo = getCourtByCounty(filingCounty);
      const idToken = await user.getIdToken();
      const response = await fetch('/.netlify/functions/submit-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          formData,
          courtInfo: courtInfo ? { name: courtInfo.name, address: courtInfo.address, phone: courtInfo.phone } : null,
          selection: {
            probateType: paymentInfo.probateType || 'full',
            accountingAddon: paymentInfo.accountingAddon || null,
            courtAppearance: paymentInfo.courtAppearance ? paymentInfo.courtAppearance.type : null,
            hearing: paymentInfo.courtAppearance || null,
            paymentPlan: paymentInfo.paymentPlan === 'installments' ? 'installments' : 'full'
          }
        })
      });
      let data = {};
      try { data = await response.json(); } catch { /* handled below */ }
      if (!response.ok) {
        setError(data.error || 'We could not send your answers. Please try again or call 818-337-4071.');
        setIsSubmitting(false);
        return;
      }
      const caseId = data.caseId;

      // Lead: GA4 generate_lead + the MyProbateCA Google Ads lead conversion
      trackLead('intake_complete');

      // Save uploaded documents to the documents collection
      const documentCategoryMap = {
        'deathCertificate': 'death-certificate',
        'originalWill': 'will',
        'codicils': 'codicil',
        'propertyDeeds': 'property-deed',
        'vehicleTitles': 'vehicle-title',
        'bankStatements': 'bank-statement',
        'lifeInsurance': 'insurance-policy'
      };
      if (formData.documents && caseId) {
        const docPromises = [];
        for (const [docId, docData] of Object.entries(formData.documents)) {
          if (docData?.uploaded && docData?.downloadURL) {
            const documentRef = doc(collection(db, 'documents'));
            docPromises.push(setDoc(documentRef, {
              id: documentRef.id,
              caseId,
              userId: user.uid,
              fileName: docData.fileName,
              fileSize: docData.fileSize,
              fileType: docData.fileType,
              category: documentCategoryMap[docId] || 'other',
              storagePath: docData.storagePath,
              downloadURL: docData.downloadURL,
              status: 'active',
              uploadedAt: serverTimestamp(),
              source: 'intake'
            }));
          }
        }
        if (docPromises.length > 0) await Promise.all(docPromises);
      }

      localStorage.removeItem(`intake-${user.uid}`);

      const next = data.status === 'attached' ? (data.addOnCheckoutUrl || '/dashboard?intake=done') : data.url;
      if (typeof next === 'string' && (next.startsWith('https://') || next.startsWith('/'))) {
        window.location.href = next;
      } else {
        setError('We could not start the payment. Please call 818-337-4071.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Intake: error submitting:', err.code || '', err.message);
      setError(err.message?.includes('offline')
        ? 'Connection problem. Please check your internet connection and try again.'
        : 'We could not send your answers. Please try again or call 818-337-4071.');
      setIsSubmitting(false);
    }
  };

  const baseStep = INTAKE_STEPS[currentStep];
  const currentStepData = paidCase && baseStep.id === 'payment'
    ? { ...baseStep, title: 'Send Your Answers', shortTitle: 'Send', description: 'Your fee is already paid. Check your answers and send them to us.' }
    : baseStep;
  const isLastStep = currentStep === INTAKE_STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center flex-1">
              <div className="bg-blue-900 p-2 rounded-lg mr-3">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Probate Intake</h1>
                <p className="text-sm text-gray-500">
                  Step {currentStep + 1} of {INTAKE_STEPS.length}: {currentStepData.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Step indicators for desktop */}
          <div className="hidden md:flex justify-between mt-4">
            {INTAKE_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => index <= currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-1 max-w-[60px] text-center truncate ${
                  index === currentStep ? 'text-blue-900 font-medium' : 'text-gray-500'
                }`}>
                  {paidCase && step.id === 'payment' ? 'Send' : (step.shortTitle || step.title)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h2>
          {currentStepData.description && (
            <p className="text-gray-600 mb-6">{currentStepData.description}</p>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {renderStep()}
        </div>

        {/* Missing Fields Warning */}
        {!canProceed() && !isLastStep && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800">
              Please complete the following required fields to continue:
            </p>
            <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
              {getMissingFields().map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Buttons - hide on payment step since it has its own submit */}
        {currentStepData.id !== 'payment' && (
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                !canProceed()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
            >
              {currentStepData.id === 'review' ? (paidCase ? 'Continue' : 'Proceed to Payment') : 'Next'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}

        {/* Previous button only on payment step */}
        {currentStepData.id === 'payment' && (
          <div className="flex justify-start mt-6">
            <button
              onClick={handlePrevious}
              className="flex items-center px-6 py-3 rounded-lg transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Review
            </button>
          </div>
        )}

        {/* Required fields note */}
        {!isLastStep && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Questions? Call{' '}
            <a href="tel:+18183374071" className="text-blue-900 font-medium hover:underline">
              818-337-4071
            </a>
            {' '}or email{' '}
            <a href="mailto:rozsa@myprobateca.com" className="text-blue-900 font-medium hover:underline">
              rozsa@myprobateca.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Intake;
