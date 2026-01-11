import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Gavel
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
  );
};

export default ActionRequired;
