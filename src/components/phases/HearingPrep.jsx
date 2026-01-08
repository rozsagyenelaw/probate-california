import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Info,
  MapPin,
  Clock,
  FileText,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const HearingPrep = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hearing, setHearing] = useState({
    date: '',
    time: '',
    department: '',
    courtAddress: '',
    caseNumber: '',
    notes: '',
    checklist: {
      petitionFiled: false,
      publicationComplete: false,
      bondObtained: false,
      noticesServed: false,
      documentsReady: false
    }
  });

  useEffect(() => {
    const loadCase = async () => {
      try {
        const q = query(collection(db, 'cases'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const caseData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          setProbateCase(caseData);
          if (caseData.hearing) {
            setHearing({ ...hearing, ...caseData.hearing });
          }
          if (caseData.caseNumber) {
            setHearing(h => ({ ...h, caseNumber: caseData.caseNumber }));
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
      const allChecked = Object.values(hearing.checklist).every(Boolean);
      await updateDoc(doc(db, 'cases', probateCase.id), {
        hearing,
        caseNumber: hearing.caseNumber || probateCase.caseNumber,
        'keyDates.firstHearing': hearing.date || null,
        'phaseStatuses.5': allChecked ? 'complete' : 'in_progress',
        updatedAt: serverTimestamp()
      });
      alert('Hearing information saved!');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const updateChecklist = (key, value) => {
    setHearing({
      ...hearing,
      checklist: { ...hearing.checklist, [key]: value }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-900 animate-spin" />
      </div>
    );
  }

  const county = probateCase?.filingCounty || probateCase?.decedent?.lastAddress?.county;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-blue-900 p-2 rounded-lg mr-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">First Hearing Preparation</h1>
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
              <p className="font-medium text-blue-900">Phase 5: First Hearing</p>
              <p className="text-sm text-blue-700">
                The first hearing is typically held 30-45 days after filing.
                The court will review your petition and may appoint you as personal representative.
              </p>
            </div>
          </div>
        </div>

        {/* Hearing Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Hearing Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Number (assigned by court)
              </label>
              <input
                type="text"
                value={hearing.caseNumber}
                onChange={(e) => setHearing({ ...hearing, caseNumber: e.target.value })}
                placeholder="e.g., 24STPB12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Hearing Date
                </label>
                <input
                  type="date"
                  value={hearing.date}
                  onChange={(e) => setHearing({ ...hearing, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  value={hearing.time}
                  onChange={(e) => setHearing({ ...hearing, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department/Courtroom
              </label>
              <input
                type="text"
                value={hearing.department}
                onChange={(e) => setHearing({ ...hearing, department: e.target.value })}
                placeholder="e.g., Department 5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline h-4 w-4 mr-1" />
                Court Address
              </label>
              <input
                type="text"
                value={hearing.courtAddress}
                onChange={(e) => setHearing({ ...hearing, courtAddress: e.target.value })}
                placeholder={county ? `${county} County Superior Court` : 'Court address'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Pre-Hearing Checklist */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Pre-Hearing Checklist
          </h2>

          <div className="space-y-3">
            {[
              { key: 'petitionFiled', label: 'Petition filed with court' },
              { key: 'publicationComplete', label: 'Publication complete (3 weeks)' },
              { key: 'bondObtained', label: 'Bond obtained (if required)' },
              { key: 'noticesServed', label: 'Notices served to all heirs' },
              { key: 'documentsReady', label: 'All documents ready for hearing' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={hearing.checklist[key]}
                  onChange={(e) => updateChecklist(key, e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700">{label}</span>
                {hearing.checklist[key] && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Hearing Reminder */}
        {hearing.date && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Hearing Reminder</p>
                <p className="text-sm text-yellow-700">
                  Arrive at least 30 minutes early. Bring copies of all filed documents
                  and identification. Dress professionally.
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
            Save Hearing Info
          </button>
        </div>
      </main>
    </div>
  );
};

export default HearingPrep;
