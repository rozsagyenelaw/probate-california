import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  FileCheck,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  Download,
  Loader2
} from 'lucide-react';

const FinalPetition = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalPetition, setFinalPetition] = useState({
    de160FiledFinal: false,
    de161Filed: false, // Final Report and Petition for Final Distribution
    hearingDate: '',
    hearingTime: '',
    department: '',
    accountingComplete: false,
    distributionPlanComplete: false,
    waiversSigned: false,
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
          if (caseData.finalPetition) {
            setFinalPetition({ ...finalPetition, ...caseData.finalPetition });
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
      const allComplete = finalPetition.de161Filed &&
                          finalPetition.accountingComplete &&
                          finalPetition.distributionPlanComplete;
      await updateDoc(doc(db, 'cases', probateCase.id), {
        finalPetition,
        'keyDates.finalHearing': finalPetition.hearingDate || null,
        'phaseStatuses.10': allComplete ? 'complete' : 'in_progress',
        updatedAt: serverTimestamp()
      });
      alert('Final petition information saved!');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-blue-900 p-2 rounded-lg mr-3">
              <FileCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Final Petition for Distribution</h1>
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
              <p className="font-medium text-blue-900">Phase 10: Final Petition</p>
              <p className="text-sm text-blue-700">
                After all debts are paid and the creditor period ends, file the Final Report
                and Petition for Final Distribution (DE-161). This requests court approval
                to distribute assets to heirs.
              </p>
            </div>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Pre-Filing Requirements</h2>

          <div className="space-y-3">
            {[
              { key: 'accountingComplete', label: 'Complete estate accounting (all income and expenses)' },
              { key: 'distributionPlanComplete', label: 'Distribution plan prepared per will/intestate succession' },
              { key: 'waiversSigned', label: 'Waivers signed by heirs (if applicable)' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={finalPetition[key]}
                  onChange={(e) => setFinalPetition({ ...finalPetition, [key]: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700">{label}</span>
                {finalPetition[key] && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* DE-161 Filing */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">DE-161 Final Report & Petition</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={finalPetition.de161Filed}
                onChange={(e) => setFinalPetition({ ...finalPetition, de161Filed: e.target.checked })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">
                DE-161 Final Report and Petition for Final Distribution filed
              </span>
            </div>

            <button
              onClick={() => navigate('/petition')}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Download className="h-5 w-5 mr-2" />
              Generate Final Forms
            </button>
          </div>
        </div>

        {/* Final Hearing */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Final Hearing</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Hearing Date
                </label>
                <input
                  type="date"
                  value={finalPetition.hearingDate}
                  onChange={(e) => setFinalPetition({ ...finalPetition, hearingDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={finalPetition.hearingTime}
                  onChange={(e) => setFinalPetition({ ...finalPetition, hearingTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={finalPetition.department}
                onChange={(e) => setFinalPetition({ ...finalPetition, department: e.target.value })}
                placeholder="e.g., Department 5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={finalPetition.notes}
                onChange={(e) => setFinalPetition({ ...finalPetition, notes: e.target.value })}
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
            Save
          </button>
        </div>
      </main>
    </div>
  );
};

export default FinalPetition;
