import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const CreditorManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creditorPeriod, setCreditorPeriod] = useState({
    startDate: '',
    endDate: '',
    claims: [],
    allClaimsResolved: false
  });
  const [newClaim, setNewClaim] = useState({
    creditor: '',
    amount: '',
    type: '',
    status: 'pending',
    notes: ''
  });
  const [showAddClaim, setShowAddClaim] = useState(false);

  useEffect(() => {
    const loadCase = async () => {
      try {
        const q = query(collection(db, 'cases'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const caseData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          setProbateCase(caseData);
          if (caseData.creditorPeriod) {
            setCreditorPeriod({ ...creditorPeriod, ...caseData.creditorPeriod });
          }
          // Calculate creditor period dates if letters issued
          if (caseData.keyDates?.lettersIssued && !caseData.creditorPeriod?.startDate) {
            const start = new Date(caseData.keyDates.lettersIssued);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 4); // 4 months from letters
            setCreditorPeriod(prev => ({
              ...prev,
              startDate: start.toISOString().split('T')[0],
              endDate: end.toISOString().split('T')[0]
            }));
          }
        }
      } catch (err) {
        console.error('Error loading case:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCase();
  }, [user]);

  const handleAddClaim = () => {
    if (!newClaim.creditor || !newClaim.amount) return;
    setCreditorPeriod({
      ...creditorPeriod,
      claims: [...creditorPeriod.claims, { ...newClaim, id: `claim-${Date.now()}` }]
    });
    setNewClaim({ creditor: '', amount: '', type: '', status: 'pending', notes: '' });
    setShowAddClaim(false);
  };

  const handleDeleteClaim = (id) => {
    setCreditorPeriod({
      ...creditorPeriod,
      claims: creditorPeriod.claims.filter(c => c.id !== id)
    });
  };

  const handleUpdateClaimStatus = (id, status) => {
    setCreditorPeriod({
      ...creditorPeriod,
      claims: creditorPeriod.claims.map(c =>
        c.id === id ? { ...c, status } : c
      )
    });
  };

  const handleSave = async () => {
    if (!probateCase) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'cases', probateCase.id), {
        creditorPeriod,
        'keyDates.creditorPeriodEnd': creditorPeriod.endDate || null,
        'phaseStatuses.9': creditorPeriod.allClaimsResolved ? 'complete' : 'in_progress',
        updatedAt: serverTimestamp()
      });
      alert('Creditor information saved!');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-900 animate-spin" />
      </div>
    );
  }

  const totalClaims = creditorPeriod.claims.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-blue-900 p-2 rounded-lg mr-3">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Creditor Period Management</h1>
              <p className="text-sm text-gray-500">{probateCase?.estateName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Phase 9: Creditor Period</p>
              <p className="text-sm text-blue-700">
                Creditors have 4 months from the date letters were issued to file claims against the estate.
                Known creditors must be notified within 4 months of death or within 30 days of discovery.
              </p>
            </div>
          </div>
        </div>

        {/* Creditor Period Dates */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Creditor Period Timeline</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date (Letters Issued)
              </label>
              <input
                type="date"
                value={creditorPeriod.startDate}
                onChange={(e) => setCreditorPeriod({ ...creditorPeriod, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (4 months later)
              </label>
              <input
                type="date"
                value={creditorPeriod.endDate}
                onChange={(e) => setCreditorPeriod({ ...creditorPeriod, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Creditor Claims */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Creditor Claims</h2>
            <button
              onClick={() => setShowAddClaim(true)}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Claim
            </button>
          </div>

          {/* Claims Summary */}
          {creditorPeriod.claims.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-red-800 font-medium">
                  Total Claims: {creditorPeriod.claims.length}
                </span>
                <span className="text-red-900 font-bold">
                  ${totalClaims.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Add Claim Form */}
          {showAddClaim && (
            <div className="border rounded-lg p-4 mb-4 bg-gray-50">
              <h3 className="font-medium mb-3">Add Creditor Claim</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Creditor Name</label>
                    <input
                      type="text"
                      value={newClaim.creditor}
                      onChange={(e) => setNewClaim({ ...newClaim, creditor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={newClaim.amount}
                        onChange={(e) => setNewClaim({ ...newClaim, amount: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newClaim.type}
                    onChange={(e) => setNewClaim({ ...newClaim, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select type</option>
                    <option value="medical">Medical</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="mortgage">Mortgage</option>
                    <option value="auto_loan">Auto Loan</option>
                    <option value="taxes">Taxes</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddClaim(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClaim}
                    className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                  >
                    Add Claim
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Claims List */}
          {creditorPeriod.claims.length > 0 ? (
            <div className="space-y-2">
              {creditorPeriod.claims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{claim.creditor}</p>
                    <p className="text-sm text-gray-600">
                      ${parseFloat(claim.amount).toLocaleString()} - {claim.type || 'Other'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={claim.status}
                      onChange={(e) => handleUpdateClaimStatus(claim.id, e.target.value)}
                      className={`px-2 py-1 text-sm rounded ${
                        claim.status === 'paid' ? 'bg-green-100 text-green-700' :
                        claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => handleDeleteClaim(claim.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No creditor claims filed</p>
          )}
        </div>

        {/* Mark Complete */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={creditorPeriod.allClaimsResolved}
              onChange={(e) => setCreditorPeriod({ ...creditorPeriod, allClaimsResolved: e.target.checked })}
              className="h-5 w-5 text-blue-600 rounded"
            />
            <span className="ml-3 text-gray-700">
              Creditor period has ended and all claims have been resolved
            </span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center px-6 py-3 rounded-lg ${
              saving ? 'bg-gray-300 text-gray-500' : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
          >
            {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle className="h-5 w-5 mr-2" />}
            Save
          </button>
        </div>
      </main>
    </div>
  );
};

export default CreditorManagement;
