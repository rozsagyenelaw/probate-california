import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  CheckCircle,
  Info,
  Calendar,
  FileText,
  Loader2,
  PartyPopper
} from 'lucide-react';

const CaseClosing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState({
    orderApproved: false,
    orderApprovedDate: '',
    assetsDistributed: false,
    distributionDate: '',
    receiptsSigned: false,
    bondReleased: false,
    finalReceiptsFiled: false,
    caseDischargedDate: '',
    caseClosed: false,
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
          if (caseData.closing) {
            setClosing({ ...closing, ...caseData.closing });
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
      await updateDoc(doc(db, 'cases', probateCase.id), {
        closing,
        status: closing.caseClosed ? 'closed' : 'active',
        closedAt: closing.caseClosed ? serverTimestamp() : null,
        'phaseStatuses.11': closing.caseClosed ? 'complete' : 'in_progress',
        currentPhase: closing.caseClosed ? 11 : probateCase.currentPhase,
        updatedAt: serverTimestamp()
      });
      alert(closing.caseClosed ? 'Congratulations! Case has been marked as closed!' : 'Information saved!');
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
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Case Closing</h1>
              <p className="text-sm text-gray-500">{probateCase?.estateName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {closing.caseClosed ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
            <PartyPopper className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Case Closed!</h2>
            <p className="text-green-700">
              Congratulations! The probate administration has been completed successfully.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Phase 11: Case Closing</p>
                <p className="text-sm text-blue-700">
                  After the court approves the final distribution, distribute assets to heirs,
                  obtain receipts, and file final documents to close the estate.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Final Steps Checklist */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Final Steps Checklist</h2>

          <div className="space-y-3">
            {/* Order Approved */}
            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={closing.orderApproved}
                onChange={(e) => setClosing({
                  ...closing,
                  orderApproved: e.target.checked,
                  orderApprovedDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">Court order approving final distribution received</span>
              {closing.orderApproved && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
            </label>

            {/* Assets Distributed */}
            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={closing.assetsDistributed}
                onChange={(e) => setClosing({
                  ...closing,
                  assetsDistributed: e.target.checked,
                  distributionDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">All assets distributed to heirs</span>
              {closing.assetsDistributed && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
            </label>

            {/* Receipts Signed */}
            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={closing.receiptsSigned}
                onChange={(e) => setClosing({ ...closing, receiptsSigned: e.target.checked })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">Receipts signed by all heirs</span>
              {closing.receiptsSigned && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
            </label>

            {/* Final Receipts Filed */}
            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={closing.finalReceiptsFiled}
                onChange={(e) => setClosing({ ...closing, finalReceiptsFiled: e.target.checked })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">Final receipts filed with court</span>
              {closing.finalReceiptsFiled && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
            </label>

            {/* Bond Released */}
            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={closing.bondReleased}
                onChange={(e) => setClosing({ ...closing, bondReleased: e.target.checked })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 text-gray-700">Bond released (if applicable)</span>
              {closing.bondReleased && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
            </label>
          </div>
        </div>

        {/* Discharge Date */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Personal Representative Discharge</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date Discharged by Court
              </label>
              <input
                type="date"
                value={closing.caseDischargedDate}
                onChange={(e) => setClosing({ ...closing, caseDischargedDate: e.target.value })}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={closing.notes}
                onChange={(e) => setClosing({ ...closing, notes: e.target.value })}
                placeholder="Any final notes..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Mark Case Closed */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={closing.caseClosed}
              onChange={(e) => setClosing({ ...closing, caseClosed: e.target.checked })}
              className="h-6 w-6 text-green-600 rounded"
            />
            <div className="ml-3">
              <span className="text-lg font-medium text-green-900">
                Mark this case as CLOSED
              </span>
              <p className="text-sm text-green-700">
                Only check this when all steps are complete and the estate is fully administered.
              </p>
            </div>
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
            {closing.caseClosed ? 'Close Case' : 'Save Progress'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default CaseClosing;
