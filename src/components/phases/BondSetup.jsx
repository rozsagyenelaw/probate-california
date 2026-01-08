import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  Calculator,
  DollarSign,
  Loader2
} from 'lucide-react';

const BondSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bond, setBond] = useState({
    required: null,
    waived: false,
    waivedBy: '',
    amount: '',
    premium: '',
    suretyCompany: '',
    policyNumber: '',
    effectiveDate: '',
    expirationDate: '',
    notes: ''
  });

  useEffect(() => {
    const loadCase = async () => {
      try {
        const q = query(collection(db, 'cases'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const caseData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          setProbateCase(caseData);
          if (caseData.bond) {
            setBond({ ...bond, ...caseData.bond });
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

  const calculateBondAmount = () => {
    if (!probateCase) return 0;
    const assets = probateCase.assets || {};
    const totalRealProperty = (assets.realProperty || []).reduce((sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0);
    const totalFinancial = (assets.financialAccounts || []).reduce((sum, a) => sum + (parseFloat(a.estimatedValue) || 0), 0);
    const totalVehicles = (assets.vehicles || []).reduce((sum, v) => sum + (parseFloat(v.estimatedValue) || 0), 0);
    const totalPersonal = (assets.personalProperty || []).reduce((sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0);
    const totalAssets = totalRealProperty + totalFinancial + totalVehicles + totalPersonal;
    // Bond is typically 1.5x personal property + income
    return Math.ceil(totalAssets * 1.5);
  };

  const handleSave = async () => {
    if (!probateCase) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'cases', probateCase.id), {
        bond,
        'phaseStatuses.4': bond.waived || bond.policyNumber ? 'complete' : 'in_progress',
        updatedAt: serverTimestamp()
      });
      alert('Bond information saved successfully!');
    } catch (err) {
      console.error('Error saving bond:', err);
      alert('Failed to save. Please try again.');
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

  const estimatedBond = calculateBondAmount();
  const estimatedPremium = Math.ceil(estimatedBond * 0.005); // ~0.5% annual premium

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-blue-900 p-2 rounded-lg mr-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bond Setup</h1>
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
              <p className="font-medium text-blue-900">Phase 4: Bond Determination</p>
              <p className="text-sm text-blue-700">
                A probate bond protects heirs and creditors from potential mismanagement of estate assets.
                Bond may be waived by the will or by all heirs.
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Bond */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Estimated Bond Amount
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estimated Bond Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ${estimatedBond.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estimated Annual Premium</p>
              <p className="text-2xl font-bold text-blue-900">
                ${estimatedPremium.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Bond Options */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Bond Requirements</h2>

          <div className="space-y-4">
            {/* Bond waived? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is bond waived?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={bond.waived === true}
                    onChange={() => setBond({ ...bond, waived: true })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Yes, bond is waived</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={bond.waived === false}
                    onChange={() => setBond({ ...bond, waived: false })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">No, bond is required</span>
                </label>
              </div>
            </div>

            {bond.waived && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bond waived by:
                </label>
                <select
                  value={bond.waivedBy}
                  onChange={(e) => setBond({ ...bond, waivedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="will">Will provision</option>
                  <option value="heirs">All heirs</option>
                  <option value="court">Court order</option>
                </select>
              </div>
            )}

            {!bond.waived && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bond Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={bond.amount}
                        onChange={(e) => setBond({ ...bond, amount: e.target.value })}
                        placeholder={estimatedBond.toString()}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Premium
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={bond.premium}
                        onChange={(e) => setBond({ ...bond, premium: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surety Company
                  </label>
                  <input
                    type="text"
                    value={bond.suretyCompany}
                    onChange={(e) => setBond({ ...bond, suretyCompany: e.target.value })}
                    placeholder="Bond company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Number
                    </label>
                    <input
                      type="text"
                      value={bond.policyNumber}
                      onChange={(e) => setBond({ ...bond, policyNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={bond.effectiveDate}
                      onChange={(e) => setBond({ ...bond, effectiveDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={bond.notes}
                onChange={(e) => setBond({ ...bond, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
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
            Save Bond Info
          </button>
        </div>
      </main>
    </div>
  );
};

export default BondSetup;
