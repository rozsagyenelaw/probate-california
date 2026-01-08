import React from 'react';
import { FileText, Calendar, Shield, AlertCircle } from 'lucide-react';

const WillStep = ({ formData, updateFormData }) => {
  const { willExists, willDate, codicilExists, codicilDates, namedExecutor, bondWaivedInWill } = formData;

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Will Information</p>
            <p className="text-sm text-blue-700">
              Tell us about the decedent's will. This determines whether we proceed with
              "testate" (with will) or "intestate" (without will) probate.
            </p>
          </div>
        </div>
      </div>

      {/* Did decedent have a will? */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Did the decedent have a will? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="willExists"
              checked={willExists === true}
              onChange={() => handleChange('willExists', true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">Yes, there is a will</span>
              <p className="text-sm text-gray-500">Probate with Will (Testate)</p>
            </div>
          </label>
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="willExists"
              checked={willExists === false}
              onChange={() => handleChange('willExists', false)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">No, there is no will</span>
              <p className="text-sm text-gray-500">Probate without Will (Intestate)</p>
            </div>
          </label>
        </div>
      </div>

      {/* If will exists, show additional questions */}
      {willExists === true && (
        <div className="space-y-6 pt-4 border-t">
          {/* Will Date */}
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date of Will <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={willDate}
              onChange={(e) => handleChange('willDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Named Executor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who is named as Executor in the will? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namedExecutor}
              onChange={(e) => handleChange('namedExecutor', e.target.value)}
              placeholder="Full name as written in will"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This should match exactly how the name appears in the will
            </p>
          </div>

          {/* Codicils */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Are there any codicils (amendments to the will)?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="codicilExists"
                  checked={codicilExists === true}
                  onChange={() => handleChange('codicilExists', true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="codicilExists"
                  checked={codicilExists === false}
                  onChange={() => handleChange('codicilExists', false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Bond Waiver */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Shield className="inline h-4 w-4 mr-1" />
              Does the will waive bond? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bondWaivedInWill"
                  checked={bondWaivedInWill === true}
                  onChange={() => handleChange('bondWaivedInWill', true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="text-gray-900">Yes, the will waives bond</span>
                  <p className="text-sm text-gray-500">
                    Look for language like "without bond" or "bond is waived"
                  </p>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bondWaivedInWill"
                  checked={bondWaivedInWill === false}
                  onChange={() => handleChange('bondWaivedInWill', false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="text-gray-900">No / I'm not sure</span>
                  <p className="text-sm text-gray-500">
                    Bond may be required unless waived by all beneficiaries
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Intestate notice */}
      {willExists === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Intestate Succession</p>
              <p className="text-sm text-yellow-700 mt-1">
                When someone dies without a will, California's intestate succession laws
                determine who inherits. The estate will be distributed according to these
                laws, typically to the closest surviving relatives.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WillStep;
