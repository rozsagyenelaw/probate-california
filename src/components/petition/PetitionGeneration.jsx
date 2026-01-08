import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { generatePetition, downloadBlob, getRequiredForms } from '../../services/petitionService';
import {
  ArrowLeft,
  Scale,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';

const PetitionGeneration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedForms, setGeneratedForms] = useState(null);
  const [forms, setForms] = useState([]);

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
          // Find user's case
          const q = query(collection(db, 'cases'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            caseDoc = snapshot.docs[0];
          }
        }

        if (caseDoc?.exists()) {
          const caseData = { id: caseDoc.id, ...caseDoc.data() };
          setProbateCase(caseData);
          setForms(getRequiredForms(caseData));
        }
      } catch (err) {
        console.error('Error loading case:', err);
        setError('Failed to load case data');
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [caseId, user]);

  const handleGenerateForms = async () => {
    if (!probateCase) return;

    setGenerating(true);
    setError(null);

    try {
      const result = await generatePetition(probateCase);

      if (result.blob) {
        // Direct download
        downloadBlob(result.blob, result.filename || 'probate-forms.pdf');
        setGeneratedForms({ success: true, type: result.type });
      } else if (result.downloadUrl) {
        // Download URL
        window.open(result.downloadUrl, '_blank');
        setGeneratedForms(result);
      } else {
        setGeneratedForms(result);
      }

      // Update case status
      await updateDoc(doc(db, 'cases', probateCase.id), {
        'phaseStatuses.2': 'in_progress',
        petitionGenerated: true,
        petitionGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

    } catch (err) {
      console.error('Error generating forms:', err);
      setError(err.message || 'Failed to generate forms. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const openFormsGenerator = () => {
    // Open the external forms generator with case data encoded
    const params = new URLSearchParams({
      source: 'probate-app',
      caseId: probateCase?.id || ''
    });
    window.open(`https://probatepetition.netlify.app?${params.toString()}`, '_blank');
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Scale className="h-6 w-6 text-blue-900 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Petition Generation</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Case Found</h2>
            <p className="text-gray-600 mb-6">
              Complete the intake questionnaire first to create your case.
            </p>
            <button
              onClick={() => navigate('/intake')}
              className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              Start Intake
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="bg-blue-900 p-2 rounded-lg mr-3">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Generate Petition Forms</h1>
                  <p className="text-sm text-gray-500">{probateCase.estateName}</p>
                </div>
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
              <p className="font-medium text-blue-900">Phase 2: Petition Generation</p>
              <p className="text-sm text-blue-700">
                Generate the required California probate court forms based on your intake information.
                These forms will be pre-filled with the data you provided.
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {generatedForms?.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Forms Generated Successfully</p>
                <p className="text-sm text-green-700">
                  Your petition forms have been downloaded. Review them carefully before filing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Case Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Decedent</p>
              <p className="font-medium text-gray-900">
                {probateCase.decedent?.firstName} {probateCase.decedent?.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Date of Death</p>
              <p className="font-medium text-gray-900">
                {probateCase.decedent?.dateOfDeath
                  ? new Date(probateCase.decedent.dateOfDeath).toLocaleDateString()
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Probate Type</p>
              <p className="font-medium text-gray-900">
                {probateCase.willExists ? 'Testate (With Will)' : 'Intestate (Without Will)'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Filing County</p>
              <p className="font-medium text-gray-900">{probateCase.filingCounty || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-gray-500">Petitioner</p>
              <p className="font-medium text-gray-900">
                {probateCase.petitioner?.firstName} {probateCase.petitioner?.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Number of Heirs</p>
              <p className="font-medium text-gray-900">{probateCase.heirs?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Forms to Generate</h2>
          <div className="space-y-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="flex items-start p-3 bg-gray-50 rounded-lg"
              >
                <FileText className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {form.name}: {form.title}
                  </p>
                  <p className="text-sm text-gray-600">{form.description}</p>
                </div>
                {form.required && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                    Required
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generation Options */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Forms</h2>

          <div className="space-y-4">
            {/* Primary action - generate forms */}
            <button
              onClick={handleGenerateForms}
              disabled={generating}
              className={`w-full flex items-center justify-center px-6 py-4 rounded-lg text-lg transition-colors ${
                generating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
            >
              {generating ? (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  Generating Forms...
                </>
              ) : (
                <>
                  <Download className="h-6 w-6 mr-2" />
                  Generate & Download Forms
                </>
              )}
            </button>

            {/* Secondary action - use external generator */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Or use the standalone form generator:</p>
              <button
                onClick={openFormsGenerator}
                className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Forms Generator
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">Next Steps After Generation</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
            <li>Review all generated forms for accuracy</li>
            <li>Print the forms on legal-size paper (8.5" x 14")</li>
            <li>Sign where indicated (some forms require notarization)</li>
            <li>Make copies: Original for court, one for you, one for each heir</li>
            <li>File with the {probateCase.filingCounty || 'county'} Superior Court Probate Division</li>
            <li>Pay the filing fee (varies by county, typically $400-$500)</li>
          </ol>
        </div>

        {/* Regenerate option */}
        {generatedForms && (
          <div className="mt-4 text-center">
            <button
              onClick={handleGenerateForms}
              disabled={generating}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${generating ? 'animate-spin' : ''}`} />
              Regenerate Forms
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PetitionGeneration;
