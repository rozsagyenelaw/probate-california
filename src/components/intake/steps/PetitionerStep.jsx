import React from 'react';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import { RELATIONSHIPS } from '../IntakeSteps';

const PetitionerStep = ({ formData, updateFormData }) => {
  const { petitioner } = formData;

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updateFormData({
        petitioner: {
          ...petitioner,
          [parent]: {
            ...petitioner[parent],
            [child]: value
          }
        }
      });
    } else {
      updateFormData({
        petitioner: {
          ...petitioner,
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
            <p className="font-medium text-blue-900">About You (the Petitioner)</p>
            <p className="text-sm text-blue-700">
              As the petitioner, you are requesting to be appointed as the personal representative
              (executor/administrator) of the estate.
            </p>
          </div>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={petitioner.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={petitioner.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Relationship */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relationship to Decedent <span className="text-red-500">*</span>
        </label>
        <select
          value={petitioner.relationship}
          onChange={(e) => handleChange('relationship', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select Relationship</option>
          {RELATIONSHIPS.map((rel) => (
            <option key={rel} value={rel}>{rel}</option>
          ))}
        </select>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="inline h-4 w-4 mr-1" />
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={petitioner.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="inline h-4 w-4 mr-1" />
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={petitioner.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Your Address <span className="text-red-500 ml-1">*</span>
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <input
            type="text"
            value={petitioner.address.street}
            onChange={(e) => handleChange('address.street', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={petitioner.address.city}
              onChange={(e) => handleChange('address.city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={petitioner.address.state}
              onChange={(e) => handleChange('address.state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              value={petitioner.address.zip}
              onChange={(e) => handleChange('address.zip', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* California Resident */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={petitioner.isCAResident}
            onChange={(e) => handleChange('isCAResident', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            I am a resident of California
          </span>
        </label>
        {!petitioner.isCAResident && (
          <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
            Note: Non-California residents may need to post a bond and may have additional requirements.
          </p>
        )}
      </div>
    </div>
  );
};

export default PetitionerStep;
