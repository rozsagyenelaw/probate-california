import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Scale,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
  Info,
  User,
  Gavel,
  MapPin,
  Calendar,
  Phone,
  DollarSign,
  AlertCircle,
  Save,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Forms that are typically required for California probate
const PROBATE_FORMS = [
  {
    id: 'de-111',
    name: 'DE-111',
    title: 'Petition for Probate',
    description: 'Primary petition to open probate case',
    required: true
  },
  {
    id: 'de-121',
    name: 'DE-121',
    title: 'Notice of Petition to Administer Estate',
    description: 'Notice sent to heirs and beneficiaries',
    required: true
  },
  {
    id: 'de-140',
    name: 'DE-140',
    title: 'Order for Probate',
    description: 'Court order appointing personal representative',
    required: true
  },
  {
    id: 'de-147',
    name: 'DE-147',
    title: 'Duties and Liabilities of Personal Representative',
    description: 'Acknowledgment of executor duties',
    required: true
  },
  {
    id: 'de-150',
    name: 'DE-150',
    title: 'Letters',
    description: 'Letters Testamentary or Letters of Administration',
    required: true
  }
];

// Court addresses by county
const COURT_ADDRESSES = {
  'Los Angeles': {
    name: 'Stanley Mosk Courthouse',
    address: '111 N. Hill Street, Los Angeles, CA 90012',
    department: 'Probate Division',
    phone: '(213) 830-0803',
    hours: 'Mon-Fri 8:30 AM - 4:30 PM'
  },
  'Orange': {
    name: 'Lamoreaux Justice Center',
    address: '341 The City Drive South, Orange, CA 92868',
    department: 'Probate Division',
    phone: '(657) 622-5600',
    hours: 'Mon-Fri 8:00 AM - 4:00 PM'
  },
  'San Diego': {
    name: 'San Diego Superior Court',
    address: '1100 Union Street, San Diego, CA 92101',
    department: 'Probate Division',
    phone: '(619) 844-2700',
    hours: 'Mon-Fri 8:30 AM - 4:00 PM'
  },
  'San Francisco': {
    name: 'Civic Center Courthouse',
    address: '400 McAllister Street, San Francisco, CA 94102',
    department: 'Probate Division',
    phone: '(415) 551-3714',
    hours: 'Mon-Fri 8:30 AM - 4:00 PM'
  },
  'default': {
    name: 'County Superior Court',
    address: 'Contact your local court',
    department: 'Probate Division',
    phone: 'See court website',
    hours: 'Mon-Fri 8:30 AM - 4:00 PM'
  }
};

const PetitionGeneration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preparedDocuments, setPreparedDocuments] = useState([]);
  const [caseNumber, setCaseNumber] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [hearingTime, setHearingTime] = useState('');
  const [hearingDept, setHearingDept] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCaseData, setShowCaseData] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('caseId');

  useEffect(() => {
    const loadCase = async () => {
      try {
        let caseDoc;
        let loadedCaseId;

        if (caseId) {
          const docRef = doc(db, 'cases', caseId);
          caseDoc = await getDoc(docRef);
          loadedCaseId = caseId;
        } else {
          // Find user's case
          const q = query(collection(db, 'cases'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            caseDoc = snapshot.docs[0];
            loadedCaseId = caseDoc.id;
          }
        }

        if (caseDoc?.exists()) {
          const caseData = { id: caseDoc.id, ...caseDoc.data() };
          setProbateCase(caseData);

          // Load existing case number and hearing info
          if (caseData.caseNumber) setCaseNumber(caseData.caseNumber);
          if (caseData.hearing?.date) setHearingDate(caseData.hearing.date);
          if (caseData.hearing?.time) setHearingTime(caseData.hearing.time);
          if (caseData.hearing?.department) setHearingDept(caseData.hearing.department);

          // Listen for prepared documents (court-form category)
          const docsQuery = query(
            collection(db, 'documents'),
            where('caseId', '==', loadedCaseId)
          );

          const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
            const docs = snapshot.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(d => d.category === 'court-form' || d.category === 'prepared-form');
            setPreparedDocuments(docs);
          });

          setLoading(false);
          return () => unsubDocs();
        }
      } catch (err) {
        console.error('Error loading case:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [caseId, user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSaveCaseInfo = async () => {
    if (!probateCase) return;

    setSaving(true);
    try {
      const updateData = {
        updatedAt: serverTimestamp()
      };

      if (caseNumber) {
        updateData.caseNumber = caseNumber;
      }

      if (hearingDate || hearingTime || hearingDept) {
        updateData.hearing = {
          date: hearingDate || null,
          time: hearingTime || null,
          department: hearingDept || null
        };
        updateData['keyDates.firstHearing'] = hearingDate || null;
      }

      // If case number is set, move to phase 3 (publication)
      if (caseNumber && probateCase.currentPhase < 3) {
        updateData.currentPhase = 3;
        updateData['phaseStatuses.2'] = 'complete';
      }

      await updateDoc(doc(db, 'cases', probateCase.id), updateData);

      // Update local state
      setProbateCase(prev => ({
        ...prev,
        caseNumber,
        hearing: { date: hearingDate, time: hearingTime, department: hearingDept }
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving case info:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getCourtInfo = () => {
    const county = probateCase?.filingCounty;
    return COURT_ADDRESSES[county] || COURT_ADDRESSES['default'];
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return '$0';
    const numValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (isNaN(numValue)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };

  // Calculate totals for display
  const calculateTotals = () => {
    const assets = probateCase?.assets || {};
    const realProperty = (assets.realProperty || []).reduce(
      (sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0
    );
    const financial = (assets.financialAccounts || []).reduce(
      (sum, a) => sum + (parseFloat(a.estimatedValue) || 0), 0
    );
    const vehicles = (assets.vehicles || []).reduce(
      (sum, v) => sum + (parseFloat(v.estimatedValue) || 0), 0
    );
    const personal = (assets.personalProperty || []).reduce(
      (sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0
    );
    const totalAssets = realProperty + financial + vehicles + personal;

    const totalLiabilities = (probateCase?.liabilities || []).reduce(
      (sum, l) => sum + (parseFloat(l.amountOwed) || 0), 0
    );

    return {
      realProperty,
      financial,
      vehicles,
      personal,
      totalAssets,
      totalLiabilities,
      netEstate: totalAssets - totalLiabilities
    };
  };

  // Check if documents are ready
  const documentsReady = preparedDocuments.length > 0;

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
              <h1 className="text-xl font-bold text-gray-900">Petition Forms</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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
                  <h1 className="text-xl font-bold text-gray-900">Court Forms</h1>
                  <p className="text-sm text-gray-500">{probateCase.estateName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner - Changes based on whether documents are ready */}
        {documentsReady ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-green-900 mb-2">
                  Your Documents Are Ready!
                </h2>
                <p className="text-green-800 mb-3">
                  Your probate court forms have been prepared and are ready for download.
                  Please review, print, sign where indicated, and file with the court.
                </p>
                <div className="flex items-center text-sm text-green-700">
                  <User className="h-4 w-4 mr-2" />
                  <span>Prepared by: Law Offices of Rozsa Gyene, CA Bar #208356</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Gavel className="h-8 w-8 text-blue-900" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  Your Documents Are Being Prepared
                </h2>
                <p className="text-blue-800 mb-3">
                  A licensed California attorney is reviewing your case information and preparing
                  the required probate court forms. You will be notified when your documents are
                  ready for review and signature.
                </p>
                <div className="flex items-center text-sm text-blue-700">
                  <User className="h-4 w-4 mr-2" />
                  <span>Prepared by: Law Offices of Rozsa Gyene, CA Bar #208356</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Case Data Summary - Collapsible */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <button
            onClick={() => setShowCaseData(!showCaseData)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-gray-900">Questionnaire Data Summary</span>
            </div>
            {showCaseData ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {showCaseData && probateCase && (
            <div className="p-6 space-y-6">
              {/* Decedent Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Decedent Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-medium">
                      {[probateCase.decedent?.firstName, probateCase.decedent?.middleName, probateCase.decedent?.lastName]
                        .filter(Boolean).join(' ') || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date of Death</p>
                    <p className="font-medium">{probateCase.decedent?.dateOfDeath || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date of Birth</p>
                    <p className="font-medium">{probateCase.decedent?.dateOfBirth || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Address</p>
                    <p className="font-medium">
                      {probateCase.decedent?.lastAddress?.street || 'Not provided'}
                      {probateCase.decedent?.lastAddress?.city && `, ${probateCase.decedent.lastAddress.city}`}
                      {probateCase.decedent?.lastAddress?.state && `, ${probateCase.decedent.lastAddress.state}`}
                      {probateCase.decedent?.lastAddress?.zip && ` ${probateCase.decedent.lastAddress.zip}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">County</p>
                    <p className="font-medium">{probateCase.decedent?.lastAddress?.county || probateCase.filingCounty || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Marital Status</p>
                    <p className="font-medium">{probateCase.decedent?.maritalStatus || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Petitioner Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Petitioner Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">
                      {[probateCase.petitioner?.firstName, probateCase.petitioner?.lastName]
                        .filter(Boolean).join(' ') || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Relationship</p>
                    <p className="font-medium">{probateCase.petitioner?.relationship || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{probateCase.petitioner?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{probateCase.petitioner?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium">
                      {probateCase.petitioner?.address?.street || 'Not provided'}
                      {probateCase.petitioner?.address?.city && `, ${probateCase.petitioner.address.city}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">CA Resident</p>
                    <p className="font-medium">{probateCase.petitioner?.isCAResident ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Will Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Will Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Will Exists</p>
                    <p className="font-medium">{probateCase.willExists ? 'Yes (Testate)' : 'No (Intestate)'}</p>
                  </div>
                  {probateCase.willExists && (
                    <>
                      <div>
                        <p className="text-gray-500">Will Date</p>
                        <p className="font-medium">{probateCase.willDate || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Named Executor</p>
                        <p className="font-medium">{probateCase.namedExecutor || 'Not specified'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Heirs */}
              {probateCase.heirs && probateCase.heirs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">
                    Heirs/Beneficiaries ({probateCase.heirs.length})
                  </h3>
                  <div className="space-y-2">
                    {probateCase.heirs.map((heir, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {[heir.firstName, heir.lastName].filter(Boolean).join(' ')}
                          </span>
                          <span className="text-gray-500">{heir.relationship}</span>
                        </div>
                        {heir.address?.city && (
                          <p className="text-gray-500 text-xs mt-1">
                            {heir.address.city}, {heir.address.state}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estate Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Estate Summary</h3>
                {(() => {
                  const totals = calculateTotals();
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium">Real Property</p>
                        <p className="text-lg font-bold text-blue-900">{formatCurrency(totals.realProperty)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-medium">Financial Accounts</p>
                        <p className="text-lg font-bold text-green-900">{formatCurrency(totals.financial)}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-600 font-medium">Vehicles</p>
                        <p className="text-lg font-bold text-purple-900">{formatCurrency(totals.vehicles)}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-amber-600 font-medium">Personal Property</p>
                        <p className="text-lg font-bold text-amber-900">{formatCurrency(totals.personal)}</p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 md:col-span-2">
                        <p className="text-xs text-gray-600 font-medium">Total Assets</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.totalAssets)}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-red-600 font-medium">Total Liabilities</p>
                        <p className="text-lg font-bold text-red-900">{formatCurrency(totals.totalLiabilities)}</p>
                      </div>
                      <div className={`rounded-lg p-3 ${totals.netEstate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <p className={`text-xs font-medium ${totals.netEstate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Net Estate Value
                        </p>
                        <p className={`text-xl font-bold ${totals.netEstate >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                          {formatCurrency(totals.netEstate)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Real Property Details */}
              {probateCase.assets?.realProperty && probateCase.assets.realProperty.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">
                    Real Property ({probateCase.assets.realProperty.length})
                  </h3>
                  <div className="space-y-2">
                    {probateCase.assets.realProperty.map((prop, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{prop.address}</span>
                          <span className="text-green-600 font-medium">{formatCurrency(prop.estimatedValue)}</span>
                        </div>
                        {prop.apn && <p className="text-gray-500 text-xs mt-1">APN: {prop.apn}</p>}
                        {prop.mortgageBalance && (
                          <p className="text-red-500 text-xs">Mortgage: {formatCurrency(prop.mortgageBalance)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filing Instructions - Only show when documents are ready */}
        {documentsReady && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              Filing Instructions
            </h2>

            {/* Court Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                Where to File
              </h3>
              {(() => {
                const court = getCourtInfo();
                return (
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{court.name}</p>
                    <p>{court.address}</p>
                    <p>{court.department}</p>
                    <div className="flex items-center mt-2">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{court.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{court.hours}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Step by Step Instructions */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start">
                <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-gray-900">Download & Print All Forms</p>
                  <p className="text-sm text-gray-600">Download each document below and print them. Make 2 copies of each form.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-gray-900">Sign Where Indicated</p>
                  <p className="text-sm text-gray-600">Sign the original documents in blue ink where marked. Do NOT date until you are at the court.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-gray-900">Bring Required Items to Court</p>
                  <p className="text-sm text-gray-600">
                    - Original signed forms + 2 copies of each<br />
                    - Original death certificate + 1 copy<br />
                    - Original will + 1 copy (if applicable)<br />
                    - Valid photo ID<br />
                    - Filing fee payment (check or card)
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4</div>
                <div>
                  <p className="font-medium text-gray-900">File at the Probate Clerk's Window</p>
                  <p className="text-sm text-gray-600">The clerk will stamp your documents, assign a case number, and schedule your hearing.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">5</div>
                <div>
                  <p className="font-medium text-gray-900">Update Your Case Below</p>
                  <p className="text-sm text-gray-600">After filing, enter your case number and hearing date below so we can proceed with publication.</p>
                </div>
              </div>
            </div>

            {/* Filing Fee Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
              <DollarSign className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Filing Fee</p>
                <p className="text-yellow-700">The probate filing fee is approximately $435-$500 depending on the county. Payment by check or credit card is accepted at most courts.</p>
              </div>
            </div>
          </div>
        )}

        {/* Case Number & Hearing Input - Only show when documents are ready */}
        {documentsReady && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-blue-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              After Filing: Update Your Case
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              After you file at the courthouse, enter the case number and hearing information assigned by the court.
            </p>

            {probateCase?.caseNumber && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">Case filed! Case Number: <strong>{probateCase.caseNumber}</strong></span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Court Case Number *
                </label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder="e.g., 24STPB01234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hearing Date
                </label>
                <input
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hearing Time
                </label>
                <input
                  type="time"
                  value={hearingTime}
                  onChange={(e) => setHearingTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department / Courtroom
                </label>
                <input
                  type="text"
                  value={hearingDept}
                  onChange={(e) => setHearingDept(e.target.value)}
                  placeholder="e.g., Dept. 9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSaveCaseInfo}
                disabled={saving || !caseNumber}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  saving || !caseNumber
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-900 text-white hover:bg-blue-800'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Case Information
                  </>
                )}
              </button>

              {probateCase?.caseNumber && (
                <button
                  onClick={() => navigate('/publication')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Proceed to Publication
                  <ExternalLink className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Case Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Estate</p>
              <p className="font-medium text-gray-900">{probateCase.estateName}</p>
            </div>
            <div>
              <p className="text-gray-500">Filing County</p>
              <p className="font-medium text-gray-900">{probateCase.filingCounty || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-gray-500">Probate Type</p>
              <p className="font-medium text-gray-900">
                {probateCase.willExists ? 'Testate (With Will)' : 'Intestate (Without Will)'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Intake Completed</p>
              <p className="font-medium text-gray-900">{formatDate(probateCase.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Required Forms Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Court Forms</h2>
          <div className="space-y-3">
            {PROBATE_FORMS.map((form) => {
              // Check if this form has been prepared and uploaded
              const preparedDoc = preparedDocuments.find(
                d => d.formId === form.id || d.fileName?.toLowerCase().includes(form.name.toLowerCase())
              );

              return (
                <div
                  key={form.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    preparedDoc
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start flex-1">
                    <FileText className={`h-5 w-5 mr-3 mt-0.5 ${
                      preparedDoc ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {form.name}: {form.title}
                      </p>
                      <p className="text-sm text-gray-600">{form.description}</p>
                    </div>
                  </div>
                  <div className="ml-4">
                    {preparedDoc ? (
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Ready
                        </span>
                        {preparedDoc.downloadURL && (
                          <a
                            href={preparedDoc.downloadURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Document"
                          >
                            <Eye className="h-5 w-5" />
                          </a>
                        )}
                        {preparedDoc.downloadURL && (
                          <a
                            href={preparedDoc.downloadURL}
                            download
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Download"
                          >
                            <Download className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prepared Documents Section (if any uploaded) */}
        {preparedDocuments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Prepared Documents ({preparedDocuments.length})
            </h2>
            <div className="space-y-3">
              {preparedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.fileName}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.downloadURL && (
                      <>
                        <a
                          href={doc.downloadURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </a>
                        <a
                          href={doc.downloadURL}
                          download={doc.fileName}
                          className="flex items-center px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-gray-500" />
            What to Expect
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Document Preparation</p>
                <p className="text-sm text-gray-600">
                  Our attorney reviews your case and prepares all required court forms (typically 2-3 business days).
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Documents Ready for Review</p>
                <p className="text-sm text-gray-600">
                  You'll be notified when documents are uploaded. Review them for accuracy.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Sign & File</p>
                <p className="text-sm text-gray-600">
                  Print, sign where indicated, and file with the {probateCase.filingCounty || 'county'} Superior Court.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Questions? Contact us at{' '}
            <a href="mailto:rozsagyenelaw@yahoo.com" className="text-blue-600 hover:text-blue-800">
              rozsagyenelaw@yahoo.com
            </a>
            {' '}or{' '}
            <a href="tel:+18182916217" className="text-blue-600 hover:text-blue-800">
              (818) 291-6217
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default PetitionGeneration;
