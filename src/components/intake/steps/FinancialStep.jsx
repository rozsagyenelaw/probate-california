import React, { useState } from 'react';
import { Landmark, Plus, Trash2, DollarSign } from 'lucide-react';

const FinancialStep = ({ formData, updateFormData }) => {
  const { assets } = formData;
  const financialAccounts = assets?.financialAccounts || [];
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [accountForm, setAccountForm] = useState({
    accountType: '',
    institutionName: '',
    accountNumber: '',
    estimatedValue: '',
    ownershipType: ''
  });

  const accountTypes = [
    'Checking Account',
    'Savings Account',
    'Money Market Account',
    'Certificate of Deposit (CD)',
    'Brokerage Account',
    'IRA',
    '401(k)',
    'Pension',
    'Annuity',
    'Stocks/Bonds',
    'Mutual Funds',
    'Other Investment'
  ];

  const resetForm = () => {
    setAccountForm({
      accountType: '',
      institutionName: '',
      accountNumber: '',
      estimatedValue: '',
      ownershipType: ''
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!accountForm.institutionName || !accountForm.accountType) return;

    const newAccounts = [...financialAccounts];
    const itemWithId = {
      ...accountForm,
      id: editingIndex !== null ? financialAccounts[editingIndex].id : `fin-${Date.now()}`
    };

    if (editingIndex !== null) {
      newAccounts[editingIndex] = itemWithId;
    } else {
      newAccounts.push(itemWithId);
    }

    updateFormData({
      assets: {
        ...assets,
        financialAccounts: newAccounts
      }
    });
    resetForm();
  };

  const handleEdit = (index) => {
    setAccountForm(financialAccounts[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const newAccounts = financialAccounts.filter((_, i) => i !== index);
    updateFormData({
      assets: {
        ...assets,
        financialAccounts: newAccounts
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

  const getTotalValue = () => {
    return financialAccounts.reduce((sum, account) => {
      return sum + (parseFloat(account.estimatedValue) || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Landmark className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Financial Accounts</p>
            <p className="text-sm text-blue-700">
              List all bank accounts, investment accounts, retirement accounts, and other
              financial assets owned by the decedent.
            </p>
          </div>
        </div>
      </div>

      {/* Summary if accounts exist */}
      {financialAccounts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-green-800 font-medium">
              Total Financial Assets: {financialAccounts.length} account(s)
            </span>
            <span className="text-green-900 font-bold">
              {formatCurrency(getTotalValue())}
            </span>
          </div>
        </div>
      )}

      {/* Existing Accounts */}
      {financialAccounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Accounts ({financialAccounts.length})</h3>
          {financialAccounts.map((account, index) => (
            <div key={account.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{account.institutionName}</p>
                  <p className="text-sm text-gray-600">{account.accountType}</p>
                  {account.accountNumber && (
                    <p className="text-sm text-gray-500">
                      Account ending: ***{account.accountNumber.slice(-4)}
                    </p>
                  )}
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    Value: {formatCurrency(account.estimatedValue)}
                  </p>
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
          Add Financial Account
        </button>
      )}

      {/* Account Form */}
      {showForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-white">
          <h4 className="font-medium text-gray-900">
            {editingIndex !== null ? 'Edit' : 'Add'} Financial Account
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                value={accountForm.accountType}
                onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Type</option>
                {accountTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={accountForm.institutionName}
                onChange={(e) => setAccountForm({ ...accountForm, institutionName: e.target.value })}
                placeholder="e.g., Bank of America, Fidelity"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number (last 4 digits)
              </label>
              <input
                type="text"
                value={accountForm.accountNumber}
                onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="XXXX"
                maxLength={4}
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
                  type="number"
                  value={accountForm.estimatedValue}
                  onChange={(e) => setAccountForm({ ...accountForm, estimatedValue: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ownership Type
            </label>
            <select
              value={accountForm.ownershipType}
              onChange={(e) => setAccountForm({ ...accountForm, ownershipType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              <option value="Sole owner">Sole owner</option>
              <option value="Joint account">Joint account</option>
              <option value="POD/TOD beneficiary">POD/TOD with beneficiary designation</option>
              <option value="Trust">Held in trust</option>
            </select>
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
              {editingIndex !== null ? 'Update' : 'Add'} Account
            </button>
          </div>
        </div>
      )}

      {financialAccounts.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 text-center py-4">
          No financial accounts added yet. Click the button above to add bank accounts,
          investment accounts, or retirement accounts.
        </p>
      )}
    </div>
  );
};

export default FinancialStep;
