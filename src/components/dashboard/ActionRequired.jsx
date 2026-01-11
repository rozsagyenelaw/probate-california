import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  AlertCircle,
  ArrowRight,
  FileText,
  Upload,
  Calendar,
  DollarSign,
  ClipboardList,
  Scale,
  Mail,
  Download,
  Gavel,
  Hash,
  Save,
  CheckCircle,
  Loader2
} from 'lucide-react';

const PHASE_ACTIONS = {
  1: {
    title: 'Complete Intake Questionnaire',
    description: 'Provide information about the decedent, assets, and heirs',
    icon: ClipboardList,
    action: '/intake',
    buttonText: 'Start Intake',
    priority: 'high'
  },
  2: {
    title: 'Download & File Petition',
    description: 'Your petition documents are ready for download and filing with the court',
    icon: Download,
    action: '/petition',
    buttonText: 'View Petition',
    priority: 'high'
  },
  3: {
    title: 'Order Publication',
    description: 'Contact an approved newspaper to publish notice of the probate',
    icon: FileText,
    action: '/publication',
    buttonText: 'View Instructions',
    priority: 'medium'
  },
  4: {
    title: 'Arrange Bond (if required)',
    description: 'Contact a bond company if bond is required for your case',
    icon: DollarSign,
    action: '/bond',
    buttonText: 'View Bond Info',
    priority: 'medium'
  },
  5: {
    title: 'Prepare for First Hearing',
    description: 'Review what to expect at your first probate hearing',
    icon: Gavel,
    action: '/hearing',
    buttonText: 'View Hearing Guide',
    priority: 'high'
  },
  6: {
    title: 'Address Examiner Notes',
    description: 'Upload examiner notes for attorney review and supplement preparation',
    icon: FileText,
    action: '/supplements',
    buttonText: 'Upload Notes',
    priority: 'high'
  },
  7: {
    title: 'Complete Post-Hearing Tasks',
    description: 'Upload Letters and complete EIN application',
    icon: Mail,
    action: '/letters',
    buttonText: 'View Tasks',
    priority: 'high'
  },
  8: {
    title: 'Complete Inventory & Appraisal',
    description: 'Work with probate referee to complete asset appraisal',
    icon: ClipboardList,
    action: '/inventory',
    buttonText: 'View Inventory',
    priority: 'medium'
  },
  9: {
    title: 'Manage Creditor Claims',
    description: 'Review and respond to any creditor claims received',
    icon: FileText,
    action: '/creditors',
    buttonText: 'View Claims',
    priority: 'medium'
  },
  10: {
    title: 'Prepare Final Distribution',
    description: 'Complete accounting and prepare for final distribution',
    icon: Scale,
    action: '/distribution',
    buttonText: 'View Distribution',
    priority: 'high'
  },
  11: {
    title: 'Close the Estate',
    description: 'Complete distributions and file discharge papers',
    icon: FileText,
    action: '/closing',
    buttonText: 'View Closing Tasks',
    priority: 'high'
  }
};

// Case Number Entry Component for Phase 2
const CaseNumberEntry = ({ probateCase }) => {
  const [caseNumber, setCaseNumber] = useState(probateCase?.caseNumber || '');
  const [hearingDate, setHearingDate] = useState(probateCase?.hearing?.date || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!probateCase?.id || !caseNumber.trim()) return;

    setSaving(true);
    try {
      const updateData = {
        caseNumber: caseNumber.trim(),
        updatedAt: serverTimestamp()
      };

      if (hearingDate) {
        updateData.hearing = {
          ...probateCase.hearing,
          date: hearingDate
        };
        updateData['keyDates.firstHearing'] = hearingDate;
      }

      // Move to phase 3 when case number is entered
      if (probateCase.currentPhase < 3) {
        updateData.currentPhase = 3;
        updateData['phaseStatuses.2'] = 'complete';
      }

      await updateDoc(doc(db, 'cases', probateCase.id), updateData);
      setSaved(true);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Error saving case number:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Don't show if case number already entered
  if (probateCase?.caseNumber) {
    return (
      <div className="rounded-lg border-2 p-4 border-green-200 bg-green-50 mt-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">
            Case Filed: <strong>{probateCase.caseNumber}</strong>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 p-6 border-blue-200 bg-blue-50 mt-4">
      <div className="flex items-start mb-4">
        <div className="p-2 rounded-lg mr-3 bg-blue-100">
          <Hash className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Already Filed? Enter Your Case Number</h3>
          <p className="text-sm text-gray-600">
            After filing at the courthouse, enter your case number to proceed to publication.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Court Case Number *
          </label>
          <input
            type="text"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            placeholder="e.g., 24STPB01234"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hearing Date (if assigned)
          </label>
          <input
            type="date"
            value={hearingDate}
            onChange={(e) => setHearingDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !caseNumber.trim()}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
          saving || !caseNumber.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-900 text-white hover:bg-blue-800'
        }`}
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Saved! Refreshing...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Case Number
          </>
        )}
      </button>
    </div>
  );
};

const ActionRequired = ({ currentPhase = 1, probateCase }) => {
  const navigate = useNavigate();

  // Special handling for pending_payment status
  if (probateCase?.status === 'pending_payment') {
    return (
      <div className="rounded-lg border-2 p-6 border-yellow-200 bg-yellow-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="p-3 rounded-lg mr-4 bg-yellow-100">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                  Payment Required
                </span>
              </div>
              <p className="text-gray-600">
                Your intake questionnaire has been submitted. Complete your payment to begin the probate process.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Your attorney will review your case and begin preparing documents once payment is received.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Intake Complete - Awaiting Payment
          </p>
          <button
            onClick={() => navigate('/payment')}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            Complete Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Special handling when intake is complete but we're still on phase 1
  if (currentPhase === 1 && probateCase?.intakeCompletedAt) {
    return (
      <div className="rounded-lg border-2 p-6 border-green-200 bg-green-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="p-3 rounded-lg mr-4 bg-green-100">
              <Scale className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">Case Under Review</h3>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  In Progress
                </span>
              </div>
              <p className="text-gray-600">
                Your intake has been received. Attorney Rozsa Gyene is reviewing your case and preparing the initial petition documents.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                You will be notified when your petition documents are ready for review.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Phase 1 of 11 - Attorney Review
          </p>
        </div>
      </div>
    );
  }

  const action = PHASE_ACTIONS[currentPhase];

  if (!action) return null;

  const Icon = action.icon;

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Action Required
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`rounded-lg border-2 p-6 ${getPriorityStyle(action.priority)}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div
              className={`p-3 rounded-lg mr-4 ${
                action.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
              }`}
            >
              <Icon
                className={`h-6 w-6 ${
                  action.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                {getPriorityBadge(action.priority)}
              </div>
              <p className="text-gray-600">{action.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Phase {currentPhase} of 11
          </p>
          <button
            onClick={() => navigate(action.action)}
            className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
          >
            {action.buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Show case number entry for phase 2 */}
      {currentPhase === 2 && <CaseNumberEntry probateCase={probateCase} />}
    </>
  );
};

export default ActionRequired;
