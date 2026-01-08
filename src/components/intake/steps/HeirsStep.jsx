import React, { useState } from 'react';
import { Users, Plus, Trash2, AlertCircle } from 'lucide-react';
import { RELATIONSHIPS } from '../IntakeSteps';

const HeirsStep = ({ formData, updateFormData }) => {
  const { heirs, willExists } = formData;
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [heirForm, setHeirForm] = useState({
    firstName: '',
    lastName: '',
    relationship: '',
    address: {
      street: '',
      city: '',
      state: 'CA',
      zip: ''
    },
    age: 'Adult',
    isDeceased: false,
    sharePercentage: '',
    waivedBond: false
  });

  const resetForm = () => {
    setHeirForm({
      firstName: '',
      lastName: '',
      relationship: '',
      address: { street: '', city: '', state: 'CA', zip: '' },
      age: 'Adult',
      isDeceased: false,
      sharePercentage: '',
      waivedBond: false
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleSaveHeir = () => {
    if (!heirForm.firstName || !heirForm.lastName || !heirForm.relationship) {
      return;
    }

    const newHeirs = [...heirs];
    const heirWithId = {
      ...heirForm,
      id: editingIndex !== null ? heirs[editingIndex].id : `heir-${Date.now()}`
    };

    if (editingIndex !== null) {
      newHeirs[editingIndex] = heirWithId;
    } else {
      newHeirs.push(heirWithId);
    }

    updateFormData({ heirs: newHeirs });
    resetForm();
  };

  const handleEditHeir = (index) => {
    setHeirForm(heirs[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDeleteHeir = (index) => {
    const newHeirs = heirs.filter((_, i) => i !== index);
    updateFormData({ heirs: newHeirs });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Users className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Heirs & Beneficiaries</p>
            <p className="text-sm text-blue-700">
              {willExists
                ? 'List all beneficiaries named in the will.'
                : 'List all persons who may inherit under California intestate succession laws (spouse, children, parents, siblings, etc.).'}
            </p>
          </div>
        </div>
      </div>

      {/* Existing Heirs List */}
      {heirs.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">
            Added Heirs ({heirs.length})
          </h3>
          {heirs.map((heir, index) => (
            <div
              key={heir.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {heir.firstName} {heir.lastName}
                  {heir.isDeceased && (
                    <span className="ml-2 text-sm text-gray-500">(Deceased)</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {heir.relationship} • {heir.age}
                  {heir.sharePercentage && ` • ${heir.sharePercentage}%`}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditHeir(index)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteHeir(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Heir Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors w-full justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add {heirs.length > 0 ? 'Another ' : ''}Heir/Beneficiary
        </button>
      )}

      {/* Heir Form */}
      {showForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-white">
          <h4 className="font-medium text-gray-900">
            {editingIndex !== null ? 'Edit' : 'Add'} Heir/Beneficiary
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={heirForm.firstName}
                onChange={(e) => setHeirForm({ ...heirForm, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={heirForm.lastName}
                onChange={(e) => setHeirForm({ ...heirForm, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                value={heirForm.relationship}
                onChange={(e) => setHeirForm({ ...heirForm, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Category
              </label>
              <select
                value={heirForm.age}
                onChange={(e) => setHeirForm({ ...heirForm, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Adult">Adult (18+)</option>
                <option value="Minor">Minor (under 18)</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={heirForm.address.street}
              onChange={(e) => setHeirForm({
                ...heirForm,
                address: { ...heirForm.address, street: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={heirForm.address.city}
                onChange={(e) => setHeirForm({
                  ...heirForm,
                  address: { ...heirForm.address, city: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={heirForm.address.state}
                onChange={(e) => setHeirForm({
                  ...heirForm,
                  address: { ...heirForm.address, state: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
              <input
                type="text"
                value={heirForm.address.zip}
                onChange={(e) => setHeirForm({
                  ...heirForm,
                  address: { ...heirForm.address, zip: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {willExists && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Share Percentage (per will)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={heirForm.sharePercentage}
                  onChange={(e) => setHeirForm({ ...heirForm, sharePercentage: e.target.value })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="ml-2 text-gray-500">%</span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={heirForm.isDeceased}
                onChange={(e) => setHeirForm({ ...heirForm, isDeceased: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">This person is deceased</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={heirForm.waivedBond}
                onChange={(e) => setHeirForm({ ...heirForm, waivedBond: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Waives bond requirement</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveHeir}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Heir
            </button>
          </div>
        </div>
      )}

      {heirs.length === 0 && !showForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">At least one heir is required</p>
              <p className="text-sm text-yellow-700">
                Please add all persons who may be entitled to inherit from the estate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeirsStep;
