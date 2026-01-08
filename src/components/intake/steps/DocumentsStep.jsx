import React from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';

const DocumentsStep = ({ formData, updateFormData }) => {
  const { documents, willExists } = formData;

  const requiredDocuments = [
    {
      id: 'deathCertificate',
      name: 'Certified Death Certificate',
      description: 'Original certified copy from the county or state vital records office',
      required: true
    },
    ...(willExists ? [{
      id: 'originalWill',
      name: 'Original Will',
      description: 'The original signed will document (not a copy)',
      required: true
    }] : []),
    ...(willExists && formData.codicilExists ? [{
      id: 'codicils',
      name: 'Codicils',
      description: 'All amendments to the will',
      required: true
    }] : []),
    {
      id: 'propertyDeeds',
      name: 'Property Deeds',
      description: 'Deed(s) for any real property owned by the decedent',
      required: false
    },
    {
      id: 'vehicleTitles',
      name: 'Vehicle Titles',
      description: 'Pink slips for any vehicles owned',
      required: false
    },
    {
      id: 'bankStatements',
      name: 'Bank/Investment Statements',
      description: 'Recent statements showing account balances',
      required: false
    },
    {
      id: 'lifeInsurance',
      name: 'Life Insurance Policies',
      description: 'Policy documents showing beneficiaries',
      required: false
    }
  ];

  const handleDocumentNote = (docId, note) => {
    updateFormData({
      documents: {
        ...documents,
        [docId]: {
          ...documents?.[docId],
          note
        }
      }
    });
  };

  const handleHasDocument = (docId, hasDocument) => {
    updateFormData({
      documents: {
        ...documents,
        [docId]: {
          ...documents?.[docId],
          hasDocument
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Document Checklist</p>
            <p className="text-sm text-blue-700">
              Review the documents needed for your probate case. You'll upload actual documents
              after your case is created. For now, indicate which documents you have available.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Document Upload Coming Next</p>
            <p className="text-sm text-yellow-700">
              After completing this intake questionnaire, you'll be able to securely upload
              your documents through the dashboard. Original documents may need to be
              mailed or delivered to our office.
            </p>
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Document Checklist</h3>

        {requiredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  {doc.required && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`has-${doc.id}`}
                    checked={documents?.[doc.id]?.hasDocument === true}
                    onChange={() => handleHasDocument(doc.id, true)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    I have this
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`has-${doc.id}`}
                    checked={documents?.[doc.id]?.hasDocument === false}
                    onChange={() => handleHasDocument(doc.id, false)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                    Need to obtain
                  </span>
                </label>
              </div>
            </div>

            {documents?.[doc.id]?.hasDocument === false && (
              <div className="mt-3">
                <label className="block text-sm text-gray-600 mb-1">
                  Notes (optional - how will you obtain this?)
                </label>
                <input
                  type="text"
                  value={documents?.[doc.id]?.note || ''}
                  onChange={(e) => handleDocumentNote(doc.id, e.target.value)}
                  placeholder="e.g., Will request from county vital records"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Documents Section */}
      <div className="border-t pt-6">
        <h3 className="font-medium text-gray-900 mb-4">Additional Documents</h3>
        <p className="text-sm text-gray-600 mb-4">
          Other documents that may be helpful (but not required):
        </p>
        <ul className="text-sm text-gray-600 space-y-2 ml-4">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Trust documents (if any assets were held in trust)
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Business ownership documents
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Retirement account statements (401k, IRA, pension)
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Outstanding bills or debt statements
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Marriage certificate (if applicable)
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Divorce decree (if applicable)
          </li>
        </ul>
      </div>

      {/* Upload placeholder message */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Document Upload Available After Case Creation</p>
        <p className="text-sm text-gray-500 mt-1">
          Once you submit this questionnaire and your case is created, you'll be able to
          securely upload documents through your dashboard.
        </p>
      </div>
    </div>
  );
};

export default DocumentsStep;
