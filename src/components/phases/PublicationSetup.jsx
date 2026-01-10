import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
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
  Clock,
  Phone,
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

  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('caseId');

  useEffect(() => {
    const loadCase = async () => {
      try {
        let loadedCaseId;

        if (caseId) {
          loadedCaseId = caseId;
        } else {
          const q = query(collection(db, 'cases'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            loadedCaseId = snapshot.docs[0].id;
          }
        }

        if (loadedCaseId) {
          // Use onSnapshot to get real-time updates
          const unsubscribe = onSnapshot(doc(db, 'cases', loadedCaseId), (snapshot) => {
            if (snapshot.exists()) {
              setProbateCase({ id: snapshot.id, ...snapshot.data() });
            }
            setLoading(false);
          });

          return () => unsubscribe();
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading case:', err);
        setLoading(false);
      }
    };

    loadCase();
  }, [caseId, user]);

  const getNewspapersForCounty = () => {
    const county = probateCase?.filingCounty || probateCase?.decedent?.lastAddress?.county;
    return NEWSPAPERS_BY_COUNTY[county] || NEWSPAPERS_BY_COUNTY['default'];
  };

  const publication = probateCase?.publication || {};
  const publicationStatus = publication.status || 'pending';

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
                <h1 className="text-xl font-bold text-gray-900">Publication Status</h1>
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

        {/* Publication Status Banner */}
        {publicationStatus === 'completed' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-green-900 mb-2">Publication Complete!</h2>
                <p className="text-green-800">
                  The required newspaper publication has been completed. You can now proceed to the next phase.
                </p>
              </div>
            </div>
          </div>
        ) : publicationStatus === 'arranged' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-yellow-900 mb-2">Publication In Progress</h2>
                <p className="text-yellow-800">
                  Your notice is currently being published in the newspaper. Publication runs for 3 consecutive weeks.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Publication Being Arranged</h2>
                <p className="text-blue-800">
                  We are arranging for your probate notice to be published in an adjudicated newspaper in {county} County.
                  You will be notified once publication begins.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Newspaper Information (if provided by admin) */}
        {publication.newspaperName && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Publication Details</h2>
            <div className="space-y-3">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Newspaper className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{publication.newspaperName}</p>
                  {publication.newspaperPhone && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{publication.newspaperPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {publication.notes && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Notes from Attorney:</p>
                  <p className="text-sm text-blue-800">{publication.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What Publication Means */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What is Publication?</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              <strong>Legal Requirement:</strong> California Probate Code requires that notice of your petition be
              published in a newspaper of general circulation in the county where the petition is filed.
            </p>
            <p>
              <strong>Purpose:</strong> This notifies creditors and any interested parties about the probate
              proceeding, giving them an opportunity to file claims or objections.
            </p>
            <p>
              <strong>Duration:</strong> The notice must be published once a week for three consecutive weeks.
              The first publication date must be at least 15 days before the hearing.
            </p>
            <p>
              <strong>Proof of Publication:</strong> After the publication period ends, the newspaper will provide
              a "Proof of Publication" which must be filed with the court before the hearing.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            Publication Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 ${
                publicationStatus !== 'pending' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {publicationStatus !== 'pending' ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <div>
                <p className="font-medium text-gray-900">Arrange Publication</p>
                <p className="text-sm text-gray-600">
                  Attorney contacts newspaper and arranges for notice publication
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 ${
                publicationStatus === 'completed' ? 'bg-green-600 text-white' :
                publicationStatus === 'arranged' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {publicationStatus === 'completed' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <div>
                <p className="font-medium text-gray-900">Publication Runs (3 weeks)</p>
                <p className="text-sm text-gray-600">
                  Notice appears in newspaper once per week for 3 consecutive weeks
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 ${
                publicationStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {publicationStatus === 'completed' ? <CheckCircle className="h-4 w-4" /> : '3'}
              </div>
              <div>
                <p className="font-medium text-gray-900">Proof of Publication Filed</p>
                <p className="text-sm text-gray-600">
                  Newspaper provides proof, which is filed with the court
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Questions about publication? Contact us at{' '}
            <a href="mailto:rozsagyenelaw@yahoo.com" className="text-blue-600 hover:text-blue-800">
              rozsagyenelaw@yahoo.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default PublicationSetup;
