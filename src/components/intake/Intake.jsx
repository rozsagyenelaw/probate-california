import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { INTAKE_STEPS, INITIAL_FORM_STATE } from './IntakeSteps';

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

const Intake = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load saved form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`intake-${user?.uid}`);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error loading saved form data:', e);
      }
    }
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

  const canProceed = () => {
    const step = INTAKE_STEPS[currentStep];

    switch (step.id) {
      case 'decedent':
        return formData.decedent.firstName &&
               formData.decedent.lastName &&
               formData.decedent.dateOfDeath &&
               formData.decedent.lastAddress.street &&
               formData.decedent.lastAddress.city &&
               formData.decedent.lastAddress.county &&
               formData.decedent.maritalStatus;

      case 'petitioner':
        return formData.petitioner.firstName &&
               formData.petitioner.lastName &&
               formData.petitioner.relationship &&
               formData.petitioner.phone &&
               formData.petitioner.email &&
               formData.petitioner.address.street &&
               formData.petitioner.address.city &&
               formData.petitioner.address.zip;

      case 'will':
        if (formData.willExists === null) return false;
        if (formData.willExists === true) {
          return formData.willDate && formData.namedExecutor && formData.bondWaivedInWill !== null;
        }
        return true;

      case 'heirs':
        return formData.heirs.length > 0;

      case 'review':
        return true;

      default:
        return true;
    }
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create case document
      const caseRef = doc(collection(db, 'cases'));
      const caseId = caseRef.id;

      const decedentName = `${formData.decedent.firstName} ${formData.decedent.lastName}`;

      const caseData = {
        id: caseId,
        userId: user.uid,
        status: 'active',
        currentPhase: 1,
        phaseStatuses: {
          1: 'in_progress',
          2: 'pending',
          3: 'pending',
          4: 'pending',
          5: 'pending',
          6: 'pending',
          7: 'pending',
          8: 'pending',
          9: 'pending',
          10: 'pending',
          11: 'pending'
        },
        estateName: `Estate of ${decedentName}`,
        caseNumber: null,
        filingCounty: formData.decedent.lastAddress.county,
        probateType: formData.willExists ? 'testate' : 'intestate',

        // Store all intake form data
        decedent: formData.decedent,
        petitioner: formData.petitioner,
        willExists: formData.willExists,
        willDate: formData.willDate,
        codicilExists: formData.codicilExists,
        codicilDates: formData.codicilDates,
        namedExecutor: formData.namedExecutor,
        bondWaivedInWill: formData.bondWaivedInWill,
        heirs: formData.heirs,
        assets: formData.assets,
        liabilities: formData.liabilities,
        documents: formData.documents,

        // Timestamps and metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        intakeCompletedAt: serverTimestamp(),

        // Key dates (to be filled in as case progresses)
        keyDates: {
          intakeCompleted: new Date().toISOString(),
          petitionFiled: null,
          publicationStart: null,
          publicationEnd: null,
          firstHearing: null,
          lettersIssued: null,
          inventoryDue: null,
          creditorPeriodEnd: null,
          finalHearing: null
        }
      };

      await setDoc(caseRef, caseData);

      // Clear saved form data
      localStorage.removeItem(`intake-${user.uid}`);

      // Navigate to dashboard
      navigate('/dashboard', {
        state: {
          message: 'Intake completed successfully! Your case has been created.',
          caseId
        }
      });
    } catch (err) {
      console.error('Error submitting intake:', err);
      setError('Failed to submit intake. Please try again.');
      setIsSubmitting(false);
    }
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
      default:
        return null;
    }
  };

  const currentStepData = INTAKE_STEPS[currentStep];
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
                  {step.shortTitle || step.title}
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

        {/* Navigation Buttons */}
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

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className={`flex items-center px-8 py-3 rounded-lg transition-colors ${
                isSubmitting || !canProceed()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Submit & Create Case
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                !canProceed()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          )}
        </div>

        {/* Required fields note */}
        {!isLastStep && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
        )}
      </main>
    </div>
  );
};

export default Intake;
