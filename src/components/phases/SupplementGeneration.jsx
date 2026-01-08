import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  FilePlus,
  CheckCircle,
  Info,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';

const SupplementGeneration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supplements, setSupplements] = useState({
    courtCorrections: '',
    additionalHeirs: [],
    additionalAssets: [],
    generated: false,
    generatedDate: '',
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
          if (caseData.supplements) {
            setSupplements({ ...supplements, ...caseData.supplements });
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
        supplements,
        'phaseStatuses.6': supplements.generated ? 'complete' : 'in_progress',
        updatedAt: serverTimestamp()
      });
      alert('Supplement information saved!');
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
              <FilePlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Supplement Generation</h1>
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
              <p className="font-medium text-blue-900">Phase 6: Supplemental Documents</p>
              <p className="text-sm text-blue-700">
                After the first hearing, supplemental documents may be needed for corrections,
                additional heirs discovered, or newly found assets.
              </p>
            </div>
          </div>
        </div>

        {/* Check if supplements needed */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Do You Need Supplements?</h2>
          <p className="text-gray-600 mb-4">
            Supplements may be needed if:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
            <li>The court requested corrections to your petition</li>
            <li>Additional heirs have been discovered</li>
            <li>New assets have been found</li>
            <li>Information in the original petition needs to be updated</li>
          </ul>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Court-Requested Corrections (if any)
              </label>
              <textarea
                value={supplements.courtCorrections}
                onChange={(e) => setSupplements({ ...supplements, courtCorrections: e.target.value })}
                placeholder="Describe any corrections the court requested..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={supplements.notes}
                onChange={(e) => setSupplements({ ...supplements, notes: e.target.value })}
                placeholder="Additional notes about supplements..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={supplements.generated}
                  onChange={(e) => setSupplements({
                    ...supplements,
                    generated: e.target.checked,
                    generatedDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                  })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-gray-700">
                  Supplements completed / No supplements needed
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Generate Supplements */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Generate Supplemental Forms</h2>
          <p className="text-sm text-gray-600 mb-4">
            If supplements are needed, generate the appropriate forms using the petition generator.
          </p>
          <button
            onClick={() => navigate('/petition')}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Download className="h-5 w-5 mr-2" />
            Go to Form Generator
          </button>
        </div>

        {!supplements.courtCorrections && !supplements.notes && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">No Supplements Required?</p>
                <p className="text-sm text-green-700">
                  If no corrections were requested and no new information needs to be added,
                  check the box above to mark this phase complete.
                </p>
              </div>
            </div>
          </div>
        )}

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

export default SupplementGeneration;
