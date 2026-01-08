import React, { useState } from 'react';
import { Car, Package, Plus, Trash2, DollarSign } from 'lucide-react';

const VehiclesPersonalStep = ({ formData, updateFormData }) => {
  const { assets } = formData;
  const vehicles = assets?.vehicles || [];
  const personalProperty = assets?.personalProperty || [];

  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingVehicleIndex, setEditingVehicleIndex] = useState(null);
  const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);

  const [vehicleForm, setVehicleForm] = useState({
    year: '',
    make: '',
    model: '',
    vin: '',
    licensePlate: '',
    estimatedValue: '',
    lienHolder: '',
    lienAmount: ''
  });

  const [propertyForm, setPropertyForm] = useState({
    description: '',
    estimatedValue: '',
    location: ''
  });

  const resetVehicleForm = () => {
    setVehicleForm({
      year: '',
      make: '',
      model: '',
      vin: '',
      licensePlate: '',
      estimatedValue: '',
      lienHolder: '',
      lienAmount: ''
    });
    setShowVehicleForm(false);
    setEditingVehicleIndex(null);
  };

  const resetPropertyForm = () => {
    setPropertyForm({
      description: '',
      estimatedValue: '',
      location: ''
    });
    setShowPropertyForm(false);
    setEditingPropertyIndex(null);
  };

  const handleSaveVehicle = () => {
    if (!vehicleForm.make || !vehicleForm.model) return;

    const newVehicles = [...vehicles];
    const itemWithId = {
      ...vehicleForm,
      id: editingVehicleIndex !== null ? vehicles[editingVehicleIndex].id : `veh-${Date.now()}`
    };

    if (editingVehicleIndex !== null) {
      newVehicles[editingVehicleIndex] = itemWithId;
    } else {
      newVehicles.push(itemWithId);
    }

    updateFormData({
      assets: {
        ...assets,
        vehicles: newVehicles
      }
    });
    resetVehicleForm();
  };

  const handleSaveProperty = () => {
    if (!propertyForm.description) return;

    const newProperty = [...personalProperty];
    const itemWithId = {
      ...propertyForm,
      id: editingPropertyIndex !== null ? personalProperty[editingPropertyIndex].id : `pp-${Date.now()}`
    };

    if (editingPropertyIndex !== null) {
      newProperty[editingPropertyIndex] = itemWithId;
    } else {
      newProperty.push(itemWithId);
    }

    updateFormData({
      assets: {
        ...assets,
        personalProperty: newProperty
      }
    });
    resetPropertyForm();
  };

  const handleEditVehicle = (index) => {
    setVehicleForm(vehicles[index]);
    setEditingVehicleIndex(index);
    setShowVehicleForm(true);
  };

  const handleEditProperty = (index) => {
    setPropertyForm(personalProperty[index]);
    setEditingPropertyIndex(index);
    setShowPropertyForm(true);
  };

  const handleDeleteVehicle = (index) => {
    const newVehicles = vehicles.filter((_, i) => i !== index);
    updateFormData({
      assets: {
        ...assets,
        vehicles: newVehicles
      }
    });
  };

  const handleDeleteProperty = (index) => {
    const newProperty = personalProperty.filter((_, i) => i !== index);
    updateFormData({
      assets: {
        ...assets,
        personalProperty: newProperty
      }
    });
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Vehicles Section */}
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Car className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Vehicles</p>
              <p className="text-sm text-blue-700">
                List all cars, trucks, motorcycles, boats, RVs, and other vehicles
                owned by the decedent.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Vehicles */}
        {vehicles.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Vehicles ({vehicles.length})</h3>
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    {vehicle.licensePlate && (
                      <p className="text-sm text-gray-600">License: {vehicle.licensePlate}</p>
                    )}
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      Value: {formatCurrency(vehicle.estimatedValue)}
                    </p>
                    {vehicle.lienHolder && (
                      <p className="text-sm text-red-600">
                        Lien: {formatCurrency(vehicle.lienAmount)} to {vehicle.lienHolder}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditVehicle(index)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(index)}
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

        {/* Add Vehicle Button */}
        {!showVehicleForm && (
          <button
            onClick={() => setShowVehicleForm(true)}
            className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors w-full justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Vehicle
          </button>
        )}

        {/* Vehicle Form */}
        {showVehicleForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-white">
            <h4 className="font-medium text-gray-900">
              {editingVehicleIndex !== null ? 'Edit' : 'Add'} Vehicle
            </h4>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="text"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                  placeholder="2020"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleForm.make}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                  placeholder="Toyota"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  placeholder="Camry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
                <input
                  type="text"
                  value={vehicleForm.vin}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value.toUpperCase() })}
                  placeholder="Vehicle Identification Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                <input
                  type="text"
                  value={vehicleForm.licensePlate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Value <span className="text-red-500">*</span>
              </label>
              <div className="relative max-w-xs">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={vehicleForm.estimatedValue}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, estimatedValue: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lien Holder (if any)
                </label>
                <input
                  type="text"
                  value={vehicleForm.lienHolder}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, lienHolder: e.target.value })}
                  placeholder="Bank or finance company name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Owed
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={vehicleForm.lienAmount}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, lienAmount: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={resetVehicleForm}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVehicle}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
              >
                {editingVehicleIndex !== null ? 'Update' : 'Add'} Vehicle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Personal Property Section */}
      <div className="space-y-4 pt-6 border-t">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Package className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Personal Property</p>
              <p className="text-sm text-blue-700">
                List valuable personal property such as jewelry, artwork, collectibles,
                furniture, electronics, etc. Items worth less than $500 can be grouped together.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Personal Property */}
        {personalProperty.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Items ({personalProperty.length})</h3>
            {personalProperty.map((item, index) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.description}</p>
                    {item.location && (
                      <p className="text-sm text-gray-600">Location: {item.location}</p>
                    )}
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      Value: {formatCurrency(item.estimatedValue)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProperty(index)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(index)}
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

        {/* Add Property Button */}
        {!showPropertyForm && (
          <button
            onClick={() => setShowPropertyForm(true)}
            className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors w-full justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Personal Property
          </button>
        )}

        {/* Property Form */}
        {showPropertyForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-white">
            <h4 className="font-medium text-gray-900">
              {editingPropertyIndex !== null ? 'Edit' : 'Add'} Personal Property
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={propertyForm.description}
                onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                placeholder="Describe the item(s), e.g., 'Diamond engagement ring' or 'Household furniture and furnishings'"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={propertyForm.estimatedValue}
                    onChange={(e) => setPropertyForm({ ...propertyForm, estimatedValue: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={propertyForm.location}
                  onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                  placeholder="Where is the item located?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={resetPropertyForm}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProperty}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
              >
                {editingPropertyIndex !== null ? 'Update' : 'Add'} Item
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesPersonalStep;
