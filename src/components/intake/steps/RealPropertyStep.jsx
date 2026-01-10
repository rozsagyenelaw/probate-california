import React, { useState } from 'react';
import { Home, Plus, Trash2, DollarSign } from 'lucide-react';

const RealPropertyStep = ({ formData, updateFormData }) => {
  const { assets } = formData;
  const realProperty = assets?.realProperty || [];
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [propertyForm, setPropertyForm] = useState({
    address: '',
    apn: '',
    estimatedValue: '',
    titleHolding: '',
    mortgageBalance: '',
    lender: ''
  });

  const resetForm = () => {
    setPropertyForm({
      address: '',
      apn: '',
      estimatedValue: '',
      titleHolding: '',
      mortgageBalance: '',
      lender: ''
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!propertyForm.address) return;

    const newProperty = [...realProperty];
    const itemWithId = {
      ...propertyForm,
      id: editingIndex !== null ? realProperty[editingIndex].id : `prop-${Date.now()}`
    };

    if (editingIndex !== null) {
      newProperty[editingIndex] = itemWithId;
    } else {
      newProperty.push(itemWithId);
    }

    updateFormData({
      assets: {
        ...assets,
        realProperty: newProperty
      }
    });
    resetForm();
  };

  const handleEdit = (index) => {
    setPropertyForm(realProperty[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const newProperty = realProperty.filter((_, i) => i !== index);
    updateFormData({
      assets: {
        ...assets,
        realProperty: newProperty
      }
    });
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    // Remove any non-numeric characters except decimal point
    const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (isNaN(numericValue)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(numericValue));
  };

  // Clean number input - remove non-numeric characters
  const handleNumberChange = (field, value) => {
    // Remove everything except digits
    const cleanValue = value.replace(/[^0-9]/g, '');
    setPropertyForm({ ...propertyForm, [field]: cleanValue });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Home className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Real Property</p>
            <p className="text-sm text-blue-700">
              List all real estate owned by the decedent, including houses, land,
              commercial property, etc. Include properties held in the decedent's name alone.
            </p>
          </div>
        </div>
      </div>

      {/* Existing Properties */}
      {realProperty.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Properties ({realProperty.length})</h3>
          {realProperty.map((property, index) => (
            <div key={property.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{property.address}</p>
                  {property.apn && (
                    <p className="text-sm text-gray-600">APN: {property.apn}</p>
                  )}
                  <div className="flex space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      Value: {formatCurrency(property.estimatedValue)}
                    </span>
                    {property.mortgageBalance && (
                      <span className="text-sm text-gray-600">
                        Mortgage: {formatCurrency(property.mortgageBalance)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors w-full justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Real Property
        </button>
      )}

      {/* Property Form */}
      {showForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-white">
          <h4 className="font-medium text-gray-900">
            {editingIndex !== null ? 'Edit' : 'Add'} Property
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={propertyForm.address}
              onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
              placeholder="123 Main St, Los Angeles, CA 90001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                APN (Assessor's Parcel Number)
              </label>
              <input
                type="text"
                value={propertyForm.apn}
                onChange={(e) => setPropertyForm({ ...propertyForm, apn: e.target.value })}
                placeholder="1234-567-890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={propertyForm.estimatedValue}
                  onChange={(e) => handleNumberChange('estimatedValue', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="800000"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How is title held?
            </label>
            <select
              value={propertyForm.titleHolding}
              onChange={(e) => setPropertyForm({ ...propertyForm, titleHolding: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              <option value="Decedent alone">Decedent alone</option>
              <option value="Joint tenancy">Joint tenancy with right of survivorship</option>
              <option value="Tenants in common">Tenants in common</option>
              <option value="Community property">Community property</option>
              <option value="Community property with survivorship">Community property with right of survivorship</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mortgage Balance (if any)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={propertyForm.mortgageBalance}
                  onChange={(e) => handleNumberChange('mortgageBalance', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lender Name
              </label>
              <input
                type="text"
                value={propertyForm.lender}
                onChange={(e) => setPropertyForm({ ...propertyForm, lender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Property
            </button>
          </div>
        </div>
      )}

      {realProperty.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 text-center py-4">
          No real property added yet. Click the button above if the decedent owned any real estate.
        </p>
      )}
    </div>
  );
};

export default RealPropertyStep;
