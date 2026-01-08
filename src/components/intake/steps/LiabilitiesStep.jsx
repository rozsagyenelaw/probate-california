import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, DollarSign, AlertTriangle } from 'lucide-react';

const LiabilitiesStep = ({ formData, updateFormData }) => {
  const { liabilities } = formData;
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [debtForm, setDebtForm] = useState({
    creditorName: '',
    debtType: '',
    accountNumber: '',
    amountOwed: '',
    monthlyPayment: '',
    isSecured: false,
    collateral: '',
    notes: ''
  });

  const debtTypes = [
    'Credit Card',
    'Medical Bills',
    'Mortgage',
    'Auto Loan',
    'Personal Loan',
    'Student Loan',
    'Tax Debt',
    'Utility Bill',
    'Funeral Expenses',
    'Legal Fees',
    'Other'
  ];

  const resetForm = () => {
    setDebtForm({
      creditorName: '',
      debtType: '',
      accountNumber: '',
      amountOwed: '',
      monthlyPayment: '',
      isSecured: false,
      collateral: '',
      notes: ''
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!debtForm.creditorName || !debtForm.debtType) return;

    const newLiabilities = [...liabilities];
    const itemWithId = {
      ...debtForm,
      id: editingIndex !== null ? liabilities[editingIndex].id : `debt-${Date.now()}`
    };

    if (editingIndex !== null) {
      newLiabilities[editingIndex] = itemWithId;
    } else {
      newLiabilities.push(itemWithId);
    }

    updateFormData({ liabilities: newLiabilities });
    resetForm();
  };

  const handleEdit = (index) => {
    setDebtForm(liabilities[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const newLiabilities = liabilities.filter((_, i) => i !== index);
    updateFormData({ liabilities: newLiabilities });
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getTotalDebt = () => {
    return liabilities.reduce((sum, debt) => {
      return sum + (parseFloat(debt.amountOwed) || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <CreditCard className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Liabilities & Debts</p>
            <p className="text-sm text-blue-700">
              List all known debts and obligations of the decedent. This includes credit cards,
              loans, medical bills, and any other amounts owed.
            </p>
          </div>
        </div>
      </div>

      {/* Info about creditor claims */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Important Note</p>
            <p className="text-sm text-yellow-700">
              After the probate case is opened, creditors will have a limited time to file claims
              against the estate. List all debts you're aware of, even if you're unsure of the
              exact amounts.
            </p>
          </div>
        </div>
      </div>

      {/* Summary if liabilities exist */}
      {liabilities.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-red-800 font-medium">
              Total Known Liabilities: {liabilities.length} debt(s)
            </span>
            <span className="text-red-900 font-bold">
              {formatCurrency(getTotalDebt())}
            </span>
          </div>
        </div>
      )}

      {/* Existing Liabilities */}
      {liabilities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Debts ({liabilities.length})</h3>
          {liabilities.map((debt, index) => (
            <div key={debt.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{debt.creditorName}</p>
                  <p className="text-sm text-gray-600">
                    {debt.debtType}
                    {debt.isSecured && ' (Secured)'}
                  </p>
                  {debt.accountNumber && (
                    <p className="text-sm text-gray-500">
                      Account ending: ***{debt.accountNumber.slice(-4)}
                    </p>
                  )}
                  <p className="text-sm font-medium text-red-600 mt-1">
                    Amount Owed: {formatCurrency(debt.amountOwed)}
                  </p>
                  {debt.collateral && (
                    <p className="text-sm text-gray-500">
                      Collateral: {debt.collateral}
                    </p>
                  )}
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
          Add Debt/Liability
        </button>
      )}

      {/* Debt Form */}
      {showForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-white">
          <h4 className="font-medium text-gray-900">
            {editingIndex !== null ? 'Edit' : 'Add'} Debt
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Creditor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={debtForm.creditorName}
                onChange={(e) => setDebtForm({ ...debtForm, creditorName: e.target.value })}
                placeholder="e.g., Chase Bank, Kaiser Hospital"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Debt Type <span className="text-red-500">*</span>
              </label>
              <select
                value={debtForm.debtType}
                onChange={(e) => setDebtForm({ ...debtForm, debtType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Type</option>
                {debtTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number (last 4 digits)
              </label>
              <input
                type="text"
                value={debtForm.accountNumber}
                onChange={(e) => setDebtForm({ ...debtForm, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="XXXX"
                maxLength={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Owed <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={debtForm.amountOwed}
                  onChange={(e) => setDebtForm({ ...debtForm, amountOwed: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Payment (if known)
            </label>
            <div className="relative max-w-xs">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={debtForm.monthlyPayment}
                onChange={(e) => setDebtForm({ ...debtForm, monthlyPayment: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={debtForm.isSecured}
                onChange={(e) => setDebtForm({ ...debtForm, isSecured: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                This is a secured debt (backed by collateral)
              </span>
            </label>

            {debtForm.isSecured && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is the collateral?
                </label>
                <input
                  type="text"
                  value={debtForm.collateral}
                  onChange={(e) => setDebtForm({ ...debtForm, collateral: e.target.value })}
                  placeholder="e.g., Home at 123 Main St, 2020 Toyota Camry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={debtForm.notes}
              onChange={(e) => setDebtForm({ ...debtForm, notes: e.target.value })}
              placeholder="Any additional information about this debt"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
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
              {editingIndex !== null ? 'Update' : 'Add'} Debt
            </button>
          </div>
        </div>
      )}

      {liabilities.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 text-center py-4">
          No debts added yet. If the decedent had any debts, click the button above to add them.
          If there are no known debts, you can proceed to the next step.
        </p>
      )}
    </div>
  );
};

export default LiabilitiesStep;
