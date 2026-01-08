import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Info,
  Calendar,
  FileText,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const LettersIssued = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [letters, setLetters] = useState({
    issued: false,
    issuedDate: '',
    lettersType: '',
    numberOfCopies: '',
    certifiedCopiesObtained: false,
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
          if (caseData.letters) {
            setLetters({ ...letters, ...caseData.letters });
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
        letters,
        'keyDates.lettersIssued': letters.issuedDate || null,
        'phaseStatuses.7': letters.issued && letters.certifiedCopiesObtained ? 'complete' : 'in_progress',
        updatedAt: serverTimestamp()
      });
      alert('Letters information saved!');
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

  const lettersType = probateCase?.willExists
    ? 'Letters Testamentary'
    : 'Letters of Administration';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-blue-900 p-2 rounded-lg mr-3">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Letters Issued</h1>
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
              <p className="font-medium text-blue-900">Phase 7: Letters Issued</p>
              <p className="text-sm text-blue-700">
                After the court approves your petition, you will receive "{lettersType}".
                These letters give you legal authority to act on behalf of the estate.
              </p>
            </div>
          </div>
        </div>

        {/* Letters Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Letters Status</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={letters.issued}
                onChange={(e) => setLetters({
                  ...letters,
                  issued: e.target.checked,
                  issuedDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                })}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <span className="ml-3 font-medium text-gray-900">
                {lettersType} have been issued
              </span>
            </div>

            {letters.issued && (
              <div className="ml-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Date Issued
                    </label>
                    <input
                      type="date"
                      value={letters.issuedDate}
                      onChange={(e) => setLetters({ ...letters, issuedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Certified Copies
                    </label>
                    <input
                      type="number"
                      value={letters.numberOfCopies}
                      onChange={(e) => setLetters({ ...letters, numberOfCopies: e.target.value })}
                      placeholder="Recommended: 5-10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={letters.certifiedCopiesObtained}
                    onChange={(e) => setLetters({ ...letters, certifiedCopiesObtained: e.target.checked })}
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700">
                    I have obtained certified copies
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={letters.notes}
                onChange={(e) => setLetters({ ...letters, notes: e.target.value })}
                placeholder="Any notes about the letters..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Important: Get Multiple Certified Copies</p>
              <p className="text-sm text-yellow-700">
                You will need certified copies of the letters for banks, title companies,
                and other institutions. Order 5-10 certified copies from the court clerk.
                Each certified copy typically costs $5-10.
              </p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            What You Can Do With Letters
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>Access the decedent's bank accounts</li>
            <li>Transfer vehicle titles</li>
            <li>Collect life insurance proceeds payable to the estate</li>
            <li>Transfer real property</li>
            <li>Manage estate business affairs</li>
            <li>Pay valid creditor claims</li>
          </ul>
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

export default LettersIssued;
