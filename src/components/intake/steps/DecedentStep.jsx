import React from 'react';
import { User, Calendar, MapPin, Hash } from 'lucide-react';
import { CA_COUNTIES, MARITAL_STATUS_OPTIONS } from '../IntakeSteps';

const DecedentStep = ({ formData, updateFormData }) => {
  const { decedent } = formData;

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updateFormData({
        decedent: {
          ...decedent,
          [parent]: {
            ...decedent[parent],
            [child]: value
          }
        }
      });
    } else {
      updateFormData({
        decedent: {
          ...decedent,
          [field]: value
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <User className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">About the Decedent</p>
            <p className="text-sm text-blue-700">
              Please provide information about the person who passed away. This information
              will be used in all court documents.
            </p>
          </div>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={decedent.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            value={decedent.middleName}
            onChange={(e) => handleChange('middleName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={decedent.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Date of Death <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={decedent.dateOfDeath}
            onChange={(e) => handleChange('dateOfDeath', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Date of Birth
          </label>
          <input
            type="date"
            value={decedent.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Place of Death */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Place of Death (City, State)
        </label>
        <input
          type="text"
          value={decedent.placeOfDeath}
          onChange={(e) => handleChange('placeOfDeath', e.target.value)}
          placeholder="e.g., Los Angeles, CA"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Last Address */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Last Known Address <span className="text-red-500 ml-1">*</span>
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <input
            type="text"
            value={decedent.lastAddress.street}
            onChange={(e) => handleChange('lastAddress.street', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={decedent.lastAddress.city}
              onChange={(e) => handleChange('lastAddress.city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={decedent.lastAddress.state}
              onChange={(e) => handleChange('lastAddress.state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              value={decedent.lastAddress.zip}
              onChange={(e) => handleChange('lastAddress.zip', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
            <select
              value={decedent.lastAddress.county}
              onChange={(e) => handleChange('lastAddress.county', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select County</option>
              {CA_COUNTIES.map((county) => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SSN Last 4 */}
      <div className="max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Hash className="inline h-4 w-4 mr-1" />
          Last 4 digits of SSN
        </label>
        <input
          type="text"
          value={decedent.ssnLast4}
          onChange={(e) => handleChange('ssnLast4', e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="XXXX"
          maxLength={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">For identification purposes only</p>
      </div>

      {/* Marital Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marital Status at Time of Death <span className="text-red-500">*</span>
        </label>
        <select
          value={decedent.maritalStatus}
          onChange={(e) => handleChange('maritalStatus', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select Status</option>
          {MARITAL_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Citizenship */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Citizenship
        </label>
        <select
          value={decedent.citizenship}
          onChange={(e) => handleChange('citizenship', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="US">United States</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
};

export default DecedentStep;
