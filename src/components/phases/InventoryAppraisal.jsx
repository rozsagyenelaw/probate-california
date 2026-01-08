import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const InventoryAppraisal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inventory, setInventory] = useState({
    de160Filed: false,
    de160FiledDate: '',
    probateRefereeAssigned: false,
    refereeName: '',
    refereePhone: '',
    appraisalScheduled: false,
    appraisalDate: '',
    appraisalComplete: false,
    appraisalCompleteDate: '',
    totalAppraisedValue: '',
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
          if (caseData.inventory) {
            setInventory({ ...inventory, ...caseData.inventory });
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

  const handleSave = async () => {
    if (!probateCase) return;
    setSaving(true);
    try {
      // Calculate inventory due date (4 months from letters issued)
      let inventoryDue = null;
      if (probateCase.keyDates?.lettersIssued) {
        const due = new Date(probateCase.keyDates.lettersIssued);
        due.setMonth(due.getMonth() + 4);
        inventoryDue = due.toISOString().split('T')[0];
      }

      await updateDoc(doc(db, 'cases', probateCase.id), {
        inventory,
        'keyDates.inventoryDue': inventoryDue,
        'phaseStatuses.8': inventory.appraisalComplete ? 'complete' : 'in_progress',
        updatedAt: serverTimestamp()
      });
      alert('Inventory information saved!');
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

  // Calculate due date
  let dueDate = 'To be determined';
  if (probateCase?.keyDates?.lettersIssued) {
    const due = new Date(probateCase.keyDates.lettersIssued);
    due.setMonth(due.getMonth() + 4);
    dueDate = due.toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-blue-900 p-2 rounded-lg mr-3">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Inventory & Appraisal</h1>
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
              <p className="font-medium text-blue-900">Phase 8: Inventory & Appraisal</p>
              <p className="text-sm text-blue-700">
                You must file an Inventory and Appraisal (DE-160) within 4 months of receiving Letters.
                A court-appointed Probate Referee will appraise non-cash assets.
              </p>
            </div>
          </div>
        </div>

        {/* Due Date Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Inventory Due Date</p>
              <p className="text-sm text-yellow-700">
                Due by: <strong>{dueDate}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* DE-160 Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">DE-160 Inventory and Appraisal</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={inventory.de160Filed}
                onChange={(e) => setInventory({
                  ...inventory,
                  de160Filed: e.target.checked,
                  de160FiledDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">DE-160 Inventory and Appraisal filed</span>
            </div>

            {inventory.de160Filed && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Filed</label>
                <input
                  type="date"
                  value={inventory.de160FiledDate}
                  onChange={(e) => setInventory({ ...inventory, de160FiledDate: e.target.value })}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Probate Referee */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Probate Referee</h2>
          <p className="text-sm text-gray-600 mb-4">
            The court will assign a Probate Referee to appraise real property,
            stocks, bonds, and other non-cash assets.
          </p>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={inventory.probateRefereeAssigned}
                onChange={(e) => setInventory({ ...inventory, probateRefereeAssigned: e.target.checked })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">Probate Referee has been assigned</span>
            </div>

            {inventory.probateRefereeAssigned && (
              <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referee Name</label>
                  <input
                    type="text"
                    value={inventory.refereeName}
                    onChange={(e) => setInventory({ ...inventory, refereeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={inventory.refereePhone}
                    onChange={(e) => setInventory({ ...inventory, refereePhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={inventory.appraisalComplete}
                onChange={(e) => setInventory({
                  ...inventory,
                  appraisalComplete: e.target.checked,
                  appraisalCompleteDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">Appraisal complete</span>
            </div>

            {inventory.appraisalComplete && (
              <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Completed</label>
                  <input
                    type="date"
                    value={inventory.appraisalCompleteDate}
                    onChange={(e) => setInventory({ ...inventory, appraisalCompleteDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Appraised Value
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={inventory.totalAppraisedValue}
                      onChange={(e) => setInventory({ ...inventory, totalAppraisedValue: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
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
            Save
          </button>
        </div>
      </main>
    </div>
  );
};

export default InventoryAppraisal;
