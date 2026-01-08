import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Scale,
  Newspaper,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Upload,
  FileText,
  Loader2
} from 'lucide-react';

// Common adjudicated newspapers by county
const NEWSPAPERS_BY_COUNTY = {
  'Los Angeles': [
    { name: 'Los Angeles Daily Journal', phone: '(213) 229-5300', website: 'dailyjournal.com' },
    { name: 'Daily Commerce', phone: '(213) 229-5300', website: 'dailycommerce.com' },
    { name: 'Metropolitan News', phone: '(213) 346-0033', website: 'metnews.com' },
  ],
  'Orange': [
    { name: 'Orange County Reporter', phone: '(714) 543-2027', website: 'thereporter.com' },
    { name: 'The Orange County Register', phone: '(877) 469-7344', website: 'ocregister.com' },
  ],
  'San Diego': [
    { name: 'San Diego Daily Transcript', phone: '(619) 232-4381', website: 'sddt.com' },
    { name: 'San Diego Commerce', phone: '(619) 231-0631', website: 'sdcommerce.com' },
  ],
  'San Francisco': [
    { name: 'Daily Journal', phone: '(415) 296-2400', website: 'dailyjournal.com' },
    { name: 'San Francisco Examiner', phone: '(415) 359-2600', website: 'sfexaminer.com' },
  ],
  'default': [
    { name: 'Contact your local court for adjudicated newspapers in your county', phone: '', website: '' }
  ]
};

const PublicationSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publication, setPublication] = useState({
    newspaperName: '',
    newspaperPhone: '',
    newspaperEmail: '',
    publicationStartDate: '',
    publicationEndDate: '',
    proofReceived: false,
    proofReceivedDate: '',
    notes: ''
  });

  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('caseId');

  useEffect(() => {
    const loadCase = async () => {
      try {
        let caseDoc;

        if (caseId) {
          const docRef = doc(db, 'cases', caseId);
          caseDoc = await getDoc(docRef);
        } else {
          const q = query(collection(db, 'cases'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            caseDoc = snapshot.docs[0];
          }
        }

        if (caseDoc?.exists()) {
          const caseData = { id: caseDoc.id, ...caseDoc.data() };
          setProbateCase(caseData);

          // Load existing publication data
          if (caseData.publication) {
            setPublication({
              ...publication,
              ...caseData.publication
            });
          }
        }
      } catch (err) {
        console.error('Error loading case:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [caseId, user]);

  const handleSave = async () => {
    if (!probateCase) return;

    setSaving(true);

    try {
      // Calculate end date (3 consecutive weeks from start)
      let endDate = publication.publicationEndDate;
      if (publication.publicationStartDate && !endDate) {
        const start = new Date(publication.publicationStartDate);
        start.setDate(start.getDate() + 21); // 3 weeks
        endDate = start.toISOString().split('T')[0];
      }

      const updateData = {
        publication: {
          ...publication,
          publicationEndDate: endDate
        },
        'keyDates.publicationStart': publication.publicationStartDate || null,
        'keyDates.publicationEnd': endDate || null,
        updatedAt: serverTimestamp()
      };

      // Update phase status if publication started
      if (publication.publicationStartDate) {
        updateData['phaseStatuses.3'] = 'in_progress';
      }

      // Mark phase complete if proof received
      if (publication.proofReceived) {
        updateData['phaseStatuses.3'] = 'complete';
      }

      await updateDoc(doc(db, 'cases', probateCase.id), updateData);

      // Update local state
      setProbateCase(prev => ({
        ...prev,
        publication: {
          ...publication,
          publicationEndDate: endDate
        }
      }));

      alert('Publication information saved successfully!');
    } catch (err) {
      console.error('Error saving publication:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getNewspapersForCounty = () => {
    const county = probateCase?.filingCounty || probateCase?.decedent?.lastAddress?.county;
    return NEWSPAPERS_BY_COUNTY[county] || NEWSPAPERS_BY_COUNTY['default'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-900 animate-spin" />
      </div>
    );
  }

  if (!probateCase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center">
              <button onClick={() => navigate('/dashboard')} className="mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <Scale className="h-6 w-6 text-blue-900 mr-2" />
              <h1 className="text-xl font-bold">Publication Setup</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Case Found</h2>
            <button onClick={() => navigate('/intake')} className="px-6 py-3 bg-blue-900 text-white rounded-lg">
              Start Intake
            </button>
          </div>
        </main>
      </div>
    );
  }

  const newspapers = getNewspapersForCounty();
  const county = probateCase?.filingCounty || probateCase?.decedent?.lastAddress?.county || 'your county';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <div className="bg-blue-900 p-2 rounded-lg mr-3">
                <Newspaper className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Publication Setup</h1>
                <p className="text-sm text-gray-500">{probateCase.estateName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Phase 3: Notice Publication</p>
              <p className="text-sm text-blue-700">
                California law requires publishing notice of the probate petition in an adjudicated
                newspaper for at least 3 consecutive weeks. This gives creditors and interested
                parties an opportunity to respond.
              </p>
            </div>
          </div>
        </div>

        {/* Publication Status */}
        {publication.proofReceived ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Publication Complete</p>
                <p className="text-sm text-green-700">
                  Proof of publication received on {publication.proofReceivedDate}.
                  You can now proceed to the next phase.
                </p>
              </div>
            </div>
          </div>
        ) : publication.publicationStartDate ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Publication In Progress</p>
                <p className="text-sm text-yellow-700">
                  Publication started on {publication.publicationStartDate}.
                  Expected completion: {publication.publicationEndDate || 'calculating...'}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Suggested Newspapers */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Adjudicated Newspapers in {county} County
          </h2>
          <div className="space-y-3">
            {newspapers.map((paper, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{paper.name}</p>
                  {paper.phone && <p className="text-sm text-gray-600">{paper.phone}</p>}
                </div>
                {paper.website && (
                  <a
                    href={`https://${paper.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Contact the newspaper to request probate notice publication. They will need a copy of your
            Notice of Petition (DE-121).
          </p>
        </div>

        {/* Publication Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Publication Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Newspaper Name
              </label>
              <input
                type="text"
                value={publication.newspaperName}
                onChange={(e) => setPublication({ ...publication, newspaperName: e.target.value })}
                placeholder="Enter newspaper name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Newspaper Phone
                </label>
                <input
                  type="tel"
                  value={publication.newspaperPhone}
                  onChange={(e) => setPublication({ ...publication, newspaperPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Newspaper Email
                </label>
                <input
                  type="email"
                  value={publication.newspaperEmail}
                  onChange={(e) => setPublication({ ...publication, newspaperEmail: e.target.value })}
                  placeholder="legals@newspaper.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Publication Date
                </label>
                <input
                  type="date"
                  value={publication.publicationStartDate}
                  onChange={(e) => setPublication({ ...publication, publicationStartDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Publication Date (auto-calculated)
                </label>
                <input
                  type="date"
                  value={publication.publicationEndDate}
                  onChange={(e) => setPublication({ ...publication, publicationEndDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 3 weeks from first publication</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={publication.notes}
                onChange={(e) => setPublication({ ...publication, notes: e.target.value })}
                placeholder="Any additional notes about the publication"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={publication.proofReceived}
                  onChange={(e) => setPublication({
                    ...publication,
                    proofReceived: e.target.checked,
                    proofReceivedDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                  })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-gray-700">I have received the Proof of Publication</span>
              </label>
              {publication.proofReceived && (
                <div className="mt-3 ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={publication.proofReceivedDate}
                    onChange={(e) => setPublication({ ...publication, proofReceivedDate: e.target.value })}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center px-6 py-3 rounded-lg ${
              saving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Save Publication Info
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Publication Process
          </h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
            <li>Contact an adjudicated newspaper in {county} County</li>
            <li>Provide them with your Notice of Petition (DE-121)</li>
            <li>Pay the publication fee (typically $100-$300)</li>
            <li>The notice must be published once per week for 3 consecutive weeks</li>
            <li>After publication, request a Proof of Publication from the newspaper</li>
            <li>Upload the Proof of Publication to your documents</li>
            <li>Mark this phase complete when you receive the proof</li>
          </ol>
        </div>

        {/* Upload Proof Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload Proof of Publication
          </button>
        </div>
      </main>
    </div>
  );
};

export default PublicationSetup;
