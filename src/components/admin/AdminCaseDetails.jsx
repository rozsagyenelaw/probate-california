import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import FormGenerator from './FormGenerator';
import {
  ArrowLeft,
  Printer,
  Download,
  User,
  Users,
  Home,
  Briefcase,
  CreditCard,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Car,
  Building,
  Scale,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Clock,
  ExternalLink,
  Upload,
  Loader2,
  Gavel,
  Eye,
  Trash2,
  Newspaper,
  Save,
  Wand2
} from 'lucide-react';

const PHASE_LABELS = {
  1: 'Intake',
  2: 'Petition',
  3: 'Publication',
  4: 'Bond',
  5: 'First Hearing',
  6: 'Supplements',
  7: 'Letters',
  8: 'Inventory',
  9: 'Creditors',
  10: 'Distribution',
  11: 'Closing'
};

const MARITAL_STATUS_LABELS = {
  'single': 'Single / Never Married',
  'married': 'Married',
  'divorced': 'Divorced',
  'widowed': 'Widowed',
  'domestic_partner': 'Domestic Partner'
};

const AdminCaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Publication management state
  const [publication, setPublication] = useState({
    newspaperName: '',
    newspaperPhone: '',
    status: 'pending', // pending, arranged, completed
    notes: ''
  });
  const [savingPublication, setSavingPublication] = useState(false);

  // Form generation state
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [showFormGenerator, setShowFormGenerator] = useState(false);

  // Copy form data to clipboard for pasting into forms
  const handleCopyFormData = () => {
    if (!caseData) return;

    setGenerating(true);
    setGenerateError(null);

    try {
      // Format case data for copying
      const decedent = caseData.decedent || {};
      const petitioner = caseData.petitioner || {};
      const heirs = caseData.heirs || [];
      const assets = caseData.assets || {};

      const formattedData = `
=== PROBATE FORM DATA ===
Estate of: ${caseData.estateName || 'N/A'}
Case ID: ${caseData.id}
Probate Type: ${caseData.willExists ? 'Testate (With Will)' : 'Intestate (No Will)'}

--- DECEDENT INFORMATION ---
Name: ${decedent.firstName || ''} ${decedent.middleName || ''} ${decedent.lastName || ''}
Date of Birth: ${decedent.dateOfBirth || 'N/A'}
Date of Death: ${decedent.dateOfDeath || 'N/A'}
Place of Death: ${decedent.placeOfDeath || 'N/A'}
SSN Last 4: ${decedent.ssnLast4 || 'N/A'}
Marital Status: ${decedent.maritalStatus || 'N/A'}

Last Address:
${decedent.lastAddress?.street || ''}
${decedent.lastAddress?.city || ''}, ${decedent.lastAddress?.state || 'CA'} ${decedent.lastAddress?.zip || ''}
County: ${decedent.lastAddress?.county || 'N/A'}

--- PETITIONER INFORMATION ---
Name: ${petitioner.firstName || ''} ${petitioner.lastName || ''}
Relationship: ${petitioner.relationship || 'N/A'}
Phone: ${petitioner.phone || 'N/A'}
Email: ${petitioner.email || 'N/A'}
CA Resident: ${petitioner.isCAResident ? 'Yes' : 'No'}

Address:
${petitioner.address?.street || ''}
${petitioner.address?.city || ''}, ${petitioner.address?.state || 'CA'} ${petitioner.address?.zip || ''}

--- WILL INFORMATION ---
Will Exists: ${caseData.willExists ? 'Yes' : 'No'}
Will Date: ${caseData.willDate || 'N/A'}
Named Executor: ${caseData.namedExecutor || 'N/A'}
Bond Waived: ${caseData.bondWaivedInWill ? 'Yes' : 'No'}

--- HEIRS/BENEFICIARIES ---
${heirs.map((h, i) => `${i + 1}. ${h.firstName || ''} ${h.lastName || ''} - ${h.relationship || 'Unknown'} - ${h.age || 'Adult'}`).join('\n') || 'None listed'}

--- REAL PROPERTY ---
${(assets.realProperty || []).map((p, i) => `${i + 1}. ${p.address || 'No address'} - APN: ${p.apn || 'N/A'} - Value: $${p.estimatedValue?.toLocaleString() || 0}`).join('\n') || 'None listed'}

--- FINANCIAL ACCOUNTS ---
${(assets.financialAccounts || []).map((a, i) => `${i + 1}. ${a.institutionName || 'Unknown'} (${a.accountType || 'Account'}) - Value: $${a.estimatedValue?.toLocaleString() || 0}`).join('\n') || 'None listed'}

--- VEHICLES ---
${(assets.vehicles || []).map((v, i) => `${i + 1}. ${v.year || ''} ${v.make || ''} ${v.model || ''} - VIN: ${v.vin || 'N/A'} - Value: $${v.estimatedValue?.toLocaleString() || 0}`).join('\n') || 'None listed'}

--- LIABILITIES ---
${(caseData.liabilities || []).map((l, i) => `${i + 1}. ${l.creditorName || 'Unknown'} - ${l.debtType || 'Debt'} - $${l.amountOwed?.toLocaleString() || 0}`).join('\n') || 'None listed'}

=== END OF FORM DATA ===
      `.trim();

      navigator.clipboard.writeText(formattedData).then(() => {
        setGenerateError('Form data copied to clipboard! Paste into your document generator.');
        setTimeout(() => setGenerateError(null), 3000);
      }).catch(() => {
        // Fallback: open in new window
        const win = window.open('', '_blank');
        win.document.write(`<pre style="font-family: monospace; white-space: pre-wrap;">${formattedData}</pre>`);
        win.document.title = 'Form Data - ' + (caseData.estateName || 'Probate Case');
      });
    } catch (error) {
      console.error('Error copying form data:', error);
      setGenerateError('Failed to copy form data. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Open external document generator with case data
  const openDocumentGenerator = () => {
    if (!caseData) return;
    // Encode case data for the generator
    const params = new URLSearchParams({
      source: 'admin',
      caseId: caseData.id,
      // You can add more params as needed by your generator
    });
    window.open(`https://probatepetition.netlify.app?${params.toString()}`, '_blank');
  };

  // Handle file upload for prepared documents
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !caseData) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `cases/${caseId}/prepared-forms/${fileName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Save document to documents collection
          const documentRef = doc(collection(db, 'documents'));
          await setDoc(documentRef, {
            id: documentRef.id,
            caseId: caseId,
            userId: caseData.userId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            category: 'court-form',
            storagePath,
            downloadURL,
            status: 'active',
            uploadedAt: serverTimestamp(),
            source: 'admin-prepared'
          });

          setUploading(false);
          setUploadProgress(0);
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!caseId) return;

    // Subscribe to case data
    const unsubCase = onSnapshot(doc(db, 'cases', caseId), (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() };
        setCaseData(data);
        // Load publication data if exists
        if (data.publication) {
          setPublication({
            newspaperName: data.publication.newspaperName || '',
            newspaperPhone: data.publication.newspaperPhone || '',
            status: data.publication.status || 'pending',
            notes: data.publication.notes || ''
          });
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading case:', error);
      setLoading(false);
    });

    // Subscribe to documents for this case
    const docsQuery = query(collection(db, 'documents'), where('caseId', '==', caseId));
    const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docsData);
    });

    return () => {
      unsubCase();
      unsubDocs();
    };
  }, [caseId]);

  // Save publication info
  const handleSavePublication = async () => {
    if (!caseData) return;

    setSavingPublication(true);
    try {
      const updateData = {
        publication: {
          newspaperName: publication.newspaperName,
          newspaperPhone: publication.newspaperPhone,
          status: publication.status,
          notes: publication.notes,
          updatedAt: new Date().toISOString()
        },
        updatedAt: serverTimestamp()
      };

      // Update phase if publication is arranged or completed
      if (publication.status === 'arranged' && caseData.currentPhase < 3) {
        updateData.currentPhase = 3;
        updateData['phaseStatuses.3'] = 'in_progress';
      }
      if (publication.status === 'completed') {
        updateData['phaseStatuses.3'] = 'complete';
        if (caseData.currentPhase < 4) {
          updateData.currentPhase = 4;
        }
      }

      await updateDoc(doc(db, 'cases', caseData.id), updateData);
    } catch (error) {
      console.error('Error saving publication:', error);
      alert('Failed to save publication info.');
    } finally {
      setSavingPublication(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (isNaN(numericValue)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(numericValue));
  };

  const formatAddress = (address) => {
    if (!address) return '-';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zip,
      address.county ? `${address.county} County` : ''
    ].filter(Boolean);
    return parts.join(', ') || '-';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text version for download
    if (!caseData) return;

    let content = `PROBATE CASE DETAILS\n`;
    content += `==========================================\n\n`;
    content += `Estate: ${caseData.estateName || 'N/A'}\n`;
    content += `Case Number: ${caseData.caseNumber || 'Not Assigned'}\n`;
    content += `Filing County: ${caseData.filingCounty || 'N/A'}\n`;
    content += `Probate Type: ${caseData.probateType === 'testate' ? 'Testate (With Will)' : 'Intestate (No Will)'}\n`;
    content += `Current Phase: ${caseData.currentPhase}. ${PHASE_LABELS[caseData.currentPhase]}\n`;
    content += `Status: ${caseData.status || 'active'}\n\n`;

    // Decedent
    const d = caseData.decedent || {};
    content += `DECEDENT INFORMATION\n`;
    content += `------------------------------------------\n`;
    content += `Name: ${d.firstName || ''} ${d.middleName || ''} ${d.lastName || ''}\n`;
    content += `Date of Birth: ${d.dateOfBirth || 'N/A'}\n`;
    content += `Date of Death: ${d.dateOfDeath || 'N/A'}\n`;
    content += `Place of Death: ${d.placeOfDeath || 'N/A'}\n`;
    content += `SSN (Last 4): ${d.ssnLast4 ? `***-**-${d.ssnLast4}` : 'N/A'}\n`;
    content += `Last Address: ${formatAddress(d.lastAddress)}\n`;
    content += `Marital Status: ${MARITAL_STATUS_LABELS[d.maritalStatus] || d.maritalStatus || 'N/A'}\n`;
    content += `Citizenship: ${d.citizenship || 'N/A'}\n\n`;

    // Petitioner
    const p = caseData.petitioner || {};
    content += `PETITIONER INFORMATION\n`;
    content += `------------------------------------------\n`;
    content += `Name: ${p.firstName || ''} ${p.lastName || ''}\n`;
    content += `Relationship: ${p.relationship || 'N/A'}\n`;
    content += `Address: ${formatAddress(p.address)}\n`;
    content += `Phone: ${p.phone || 'N/A'}\n`;
    content += `Email: ${p.email || 'N/A'}\n`;
    content += `CA Resident: ${p.isCAResident ? 'Yes' : 'No'}\n\n`;

    // Will Info
    content += `WILL INFORMATION\n`;
    content += `------------------------------------------\n`;
    content += `Will Exists: ${caseData.willExists === true ? 'Yes' : caseData.willExists === false ? 'No' : 'Unknown'}\n`;
    if (caseData.willExists) {
      content += `Will Date: ${caseData.willDate || 'N/A'}\n`;
      content += `Named Executor: ${caseData.namedExecutor || 'N/A'}\n`;
      content += `Bond Waived in Will: ${caseData.bondWaivedInWill === true ? 'Yes' : caseData.bondWaivedInWill === false ? 'No' : 'Unknown'}\n`;
    }
    content += `Codicil Exists: ${caseData.codicilExists ? 'Yes' : 'No'}\n\n`;

    // Heirs
    const heirs = caseData.heirs || [];
    content += `HEIRS & BENEFICIARIES (${heirs.length})\n`;
    content += `------------------------------------------\n`;
    heirs.forEach((heir, i) => {
      content += `${i + 1}. ${heir.firstName || ''} ${heir.lastName || ''}\n`;
      content += `   Relationship: ${heir.relationship || 'N/A'}\n`;
      content += `   Address: ${formatAddress(heir.address)}\n`;
      content += `   Phone: ${heir.phone || 'N/A'}\n`;
      content += `   Minor: ${heir.isMinor ? 'Yes' : 'No'}\n\n`;
    });

    // Assets
    const assets = caseData.assets || {};
    content += `ASSETS\n`;
    content += `------------------------------------------\n`;

    // Real Property
    const realProperty = assets.realProperty || [];
    content += `\nReal Property (${realProperty.length}):\n`;
    realProperty.forEach((prop, i) => {
      content += `${i + 1}. ${prop.address}\n`;
      content += `   APN: ${prop.apn || 'N/A'}\n`;
      content += `   Value: ${formatCurrency(prop.estimatedValue)}\n`;
      content += `   Title: ${prop.titleHolding || 'N/A'}\n`;
      content += `   Mortgage: ${formatCurrency(prop.mortgageBalance)}\n`;
      content += `   Lender: ${prop.lender || 'N/A'}\n\n`;
    });

    // Bank Accounts
    const bankAccounts = assets.bankAccounts || [];
    content += `Bank Accounts (${bankAccounts.length}):\n`;
    bankAccounts.forEach((acc, i) => {
      content += `${i + 1}. ${acc.institution} - ${acc.accountType}\n`;
      content += `   Account: ****${acc.accountLast4 || 'N/A'}\n`;
      content += `   Balance: ${formatCurrency(acc.balance)}\n\n`;
    });

    // Investments
    const investments = assets.investments || [];
    content += `Investments (${investments.length}):\n`;
    investments.forEach((inv, i) => {
      content += `${i + 1}. ${inv.institution} - ${inv.accountType}\n`;
      content += `   Value: ${formatCurrency(inv.value)}\n\n`;
    });

    // Vehicles
    const vehicles = assets.vehicles || [];
    content += `Vehicles (${vehicles.length}):\n`;
    vehicles.forEach((v, i) => {
      content += `${i + 1}. ${v.year} ${v.make} ${v.model}\n`;
      content += `   VIN: ${v.vin || 'N/A'}\n`;
      content += `   Value: ${formatCurrency(v.value)}\n\n`;
    });

    // Liabilities
    const liabilities = caseData.liabilities || [];
    content += `\nLIABILITIES (${liabilities.length})\n`;
    content += `------------------------------------------\n`;
    liabilities.forEach((l, i) => {
      content += `${i + 1}. ${l.creditor} - ${l.type}\n`;
      content += `   Amount: ${formatCurrency(l.amount)}\n`;
      content += `   Account: ${l.accountNumber || 'N/A'}\n\n`;
    });

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Case-${caseData.caseNumber || caseId}-Details.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-500">Loading case details...</span>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Case Not Found</h2>
        <p className="text-gray-500 mt-2">The requested case could not be found.</p>
        <button
          onClick={() => navigate('/admin/cases')}
          className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
        >
          Back to Cases
        </button>
      </div>
    );
  }

  const { decedent = {}, petitioner = {}, heirs = [], assets = {}, liabilities = [] } = caseData;

  // Calculate totals
  const realPropertyTotal = (assets.realProperty || []).reduce((sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0);
  const bankTotal = (assets.bankAccounts || []).reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
  const investmentTotal = (assets.investments || []).reduce((sum, i) => sum + (parseFloat(i.value) || 0), 0);
  const vehicleTotal = (assets.vehicles || []).reduce((sum, v) => sum + (parseFloat(v.value) || 0), 0);
  const personalTotal = (assets.personalProperty || []).reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
  const totalAssets = realPropertyTotal + bankTotal + investmentTotal + vehicleTotal + personalTotal;
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
  const netEstate = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header - hide print/download buttons when printing */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/cases')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Case Details</h1>
            <p className="text-gray-500">{caseData.estateName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">PROBATE CASE DETAILS</h1>
        <p className="text-lg">{caseData.estateName}</p>
        <p className="text-sm text-gray-500">Printed: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Admin Actions - Document Generation & Upload */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl shadow-sm p-6 print:hidden">
        <div className="flex items-center mb-4">
          <Gavel className="h-6 w-6 text-white mr-2" />
          <h2 className="text-lg font-semibold text-white">Admin Actions - Document Preparation</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Generate Forms */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Step 1: Generate Forms</h3>
            <p className="text-blue-100 text-sm mb-3">
              View all case data in a form layout, pre-filled with questionnaire data.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowFormGenerator(true)}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
              >
                <Wand2 className="h-5 w-5 mr-2" />
                Open Auto-Generator
              </button>
              <button
                onClick={handleCopyFormData}
                disabled={generating}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                  generating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-blue-900 hover:bg-blue-50'
                }`}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Copy as Text
                  </>
                )}
              </button>
              {generateError && (
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  generateError.includes('copied')
                    ? 'bg-green-100 border border-green-300 text-green-700'
                    : 'bg-red-100 border border-red-300 text-red-700'
                }`}>
                  {generateError}
                </div>
              )}
            </div>
          </div>

          {/* Upload Prepared Documents */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Step 2: Upload for Client</h3>
            <p className="text-blue-100 text-sm mb-3">
              After reviewing/correcting, upload the final documents for the client.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            {uploading ? (
              <div className="w-full bg-white rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
                  <span className="text-sm text-blue-900">Uploading... {Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Prepared Document
              </button>
            )}
          </div>
        </div>

        {/* Uploaded Documents for this case */}
        {documents.filter(d => d.category === 'court-form' || d.source === 'admin-prepared').length > 0 && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Uploaded Prepared Documents</h3>
            <div className="space-y-2">
              {documents
                .filter(d => d.category === 'court-form' || d.source === 'admin-prepared')
                .map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {doc.uploadedAt ? formatDate(doc.uploadedAt) : 'Just now'}
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
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <a
                            href={doc.downloadURL}
                            download={doc.fileName}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Publication Management */}
      {caseData.caseNumber && (
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl shadow-sm p-6 print:hidden">
          <div className="flex items-center mb-4">
            <Newspaper className="h-6 w-6 text-white mr-2" />
            <h2 className="text-lg font-semibold text-white">Publication Management</h2>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Newspaper Name
                </label>
                <input
                  type="text"
                  value={publication.newspaperName}
                  onChange={(e) => setPublication({ ...publication, newspaperName: e.target.value })}
                  placeholder="e.g., Los Angeles Daily Journal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Newspaper Phone
                </label>
                <input
                  type="tel"
                  value={publication.newspaperPhone}
                  onChange={(e) => setPublication({ ...publication, newspaperPhone: e.target.value })}
                  placeholder="(213) 229-5300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publication Status
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'pending', label: 'Pending', color: 'yellow' },
                  { value: 'arranged', label: 'Arranged', color: 'blue' },
                  { value: 'completed', label: 'Completed', color: 'green' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="publicationStatus"
                      value={option.value}
                      checked={publication.status === option.value}
                      onChange={(e) => setPublication({ ...publication, status: e.target.value })}
                      className={`h-4 w-4 text-${option.color}-600 focus:ring-${option.color}-500`}
                    />
                    <span className={`ml-2 text-sm ${
                      publication.status === option.value ? 'font-medium' : ''
                    }`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes for Client
              </label>
              <textarea
                value={publication.notes}
                onChange={(e) => setPublication({ ...publication, notes: e.target.value })}
                placeholder="e.g., Publication started on Jan 5, expected completion Jan 26. Contact Daily Journal at (213) 229-5300."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <button
              onClick={handleSavePublication}
              disabled={savingPublication}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                savingPublication
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {savingPublication ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Publication Info
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Case Summary Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300">
        <div className="flex items-center mb-4">
          <Scale className="h-5 w-5 text-blue-900 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Case Summary</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Case Number</p>
            <p className="font-medium">{caseData.caseNumber || 'Not Assigned'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Filing County</p>
            <p className="font-medium">{caseData.filingCounty || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Probate Type</p>
            <p className="font-medium">{caseData.probateType === 'testate' ? 'Testate (With Will)' : 'Intestate (No Will)'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Phase</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {caseData.currentPhase}. {PHASE_LABELS[caseData.currentPhase]}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              caseData.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {caseData.status || 'active'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Intake Completed</p>
            <p className="font-medium">{formatDate(caseData.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Estate Value</p>
            <p className="font-medium text-green-600">{formatCurrency(totalAssets)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Net Estate</p>
            <p className={`font-medium ${netEstate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netEstate)}
            </p>
          </div>
        </div>
      </div>

      {/* Decedent Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 text-blue-900 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Decedent Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">
              {decedent.firstName || ''} {decedent.middleName || ''} {decedent.lastName || ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="font-medium">{decedent.dateOfBirth || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Death</p>
            <p className="font-medium">{decedent.dateOfDeath || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Place of Death</p>
            <p className="font-medium">{decedent.placeOfDeath || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SSN (Last 4)</p>
            <p className="font-medium">{decedent.ssnLast4 ? `***-**-${decedent.ssnLast4}` : '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Marital Status</p>
            <p className="font-medium">{MARITAL_STATUS_LABELS[decedent.maritalStatus] || decedent.maritalStatus || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Last Address</p>
            <p className="font-medium">{formatAddress(decedent.lastAddress)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Citizenship</p>
            <p className="font-medium">{decedent.citizenship || '-'}</p>
          </div>
        </div>
      </div>

      {/* Petitioner Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
        <div className="flex items-center mb-4">
          <Briefcase className="h-5 w-5 text-blue-900 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Petitioner / Executor Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{petitioner.firstName || ''} {petitioner.lastName || ''}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Relationship to Decedent</p>
            <p className="font-medium">{petitioner.relationship || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">CA Resident</p>
            <p className="font-medium">{petitioner.isCAResident ? 'Yes' : 'No'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{formatAddress(petitioner.address)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{petitioner.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{petitioner.email || '-'}</p>
          </div>
        </div>
      </div>

      {/* Will Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-blue-900 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Will Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Will Exists</p>
            <p className="font-medium flex items-center">
              {caseData.willExists === true ? (
                <><Check className="h-4 w-4 text-green-500 mr-1" /> Yes</>
              ) : caseData.willExists === false ? (
                <><X className="h-4 w-4 text-red-500 mr-1" /> No</>
              ) : 'Unknown'}
            </p>
          </div>
          {caseData.willExists && (
            <>
              <div>
                <p className="text-sm text-gray-500">Will Date</p>
                <p className="font-medium">{caseData.willDate || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Named Executor</p>
                <p className="font-medium">{caseData.namedExecutor || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bond Waived in Will</p>
                <p className="font-medium flex items-center">
                  {caseData.bondWaivedInWill === true ? (
                    <><Check className="h-4 w-4 text-green-500 mr-1" /> Yes</>
                  ) : caseData.bondWaivedInWill === false ? (
                    <><X className="h-4 w-4 text-red-500 mr-1" /> No</>
                  ) : 'Unknown'}
                </p>
              </div>
            </>
          )}
          <div>
            <p className="text-sm text-gray-500">Codicil Exists</p>
            <p className="font-medium flex items-center">
              {caseData.codicilExists ? (
                <><Check className="h-4 w-4 text-green-500 mr-1" /> Yes</>
              ) : (
                <><X className="h-4 w-4 text-gray-400 mr-1" /> No</>
              )}
            </p>
          </div>
          {caseData.codicilExists && caseData.codicilDates?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Codicil Dates</p>
              <p className="font-medium">{caseData.codicilDates.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Heirs & Beneficiaries */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 text-blue-900 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Heirs & Beneficiaries ({heirs.length})</h2>
        </div>
        {heirs.length === 0 ? (
          <p className="text-gray-500">No heirs listed</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">#</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Relationship</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Address</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Phone</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Minor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {heirs.map((heir, index) => (
                  <tr key={heir.id || index}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium">{heir.firstName || ''} {heir.lastName || ''}</td>
                    <td className="px-4 py-2">{heir.relationship || '-'}</td>
                    <td className="px-4 py-2">{formatAddress(heir.address)}</td>
                    <td className="px-4 py-2">{heir.phone || '-'}</td>
                    <td className="px-4 py-2">
                      {heir.isMinor ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-300" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real Property */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Home className="h-5 w-5 text-blue-900 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Real Property ({(assets.realProperty || []).length})</h2>
          </div>
          <span className="text-lg font-bold text-green-600">{formatCurrency(realPropertyTotal)}</span>
        </div>
        {(assets.realProperty || []).length === 0 ? (
          <p className="text-gray-500">No real property listed</p>
        ) : (
          <div className="space-y-4">
            {(assets.realProperty || []).map((property, index) => (
              <div key={property.id || index} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{property.address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Value</p>
                    <p className="font-medium text-green-600">{formatCurrency(property.estimatedValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">APN</p>
                    <p className="font-medium">{property.apn || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Title Holding</p>
                    <p className="font-medium">{property.titleHolding || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mortgage Balance</p>
                    <p className="font-medium text-red-600">{formatCurrency(property.mortgageBalance)}</p>
                  </div>
                  {property.lender && (
                    <div>
                      <p className="text-sm text-gray-500">Lender</p>
                      <p className="font-medium">{property.lender}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bank Accounts */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Building className="h-5 w-5 text-blue-900 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Bank Accounts ({(assets.bankAccounts || []).length})</h2>
          </div>
          <span className="text-lg font-bold text-green-600">{formatCurrency(bankTotal)}</span>
        </div>
        {(assets.bankAccounts || []).length === 0 ? (
          <p className="text-gray-500">No bank accounts listed</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Institution</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Account (Last 4)</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(assets.bankAccounts || []).map((account, index) => (
                  <tr key={account.id || index}>
                    <td className="px-4 py-2 font-medium">{account.institution || '-'}</td>
                    <td className="px-4 py-2">{account.accountType || '-'}</td>
                    <td className="px-4 py-2">****{account.accountLast4 || '----'}</td>
                    <td className="px-4 py-2 text-right text-green-600 font-medium">{formatCurrency(account.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Investments */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-blue-900 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Investments ({(assets.investments || []).length})</h2>
          </div>
          <span className="text-lg font-bold text-green-600">{formatCurrency(investmentTotal)}</span>
        </div>
        {(assets.investments || []).length === 0 ? (
          <p className="text-gray-500">No investments listed</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Institution</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Account</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(assets.investments || []).map((investment, index) => (
                  <tr key={investment.id || index}>
                    <td className="px-4 py-2 font-medium">{investment.institution || '-'}</td>
                    <td className="px-4 py-2">{investment.accountType || '-'}</td>
                    <td className="px-4 py-2">****{investment.accountLast4 || '----'}</td>
                    <td className="px-4 py-2 text-right text-green-600 font-medium">{formatCurrency(investment.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vehicles */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Car className="h-5 w-5 text-blue-900 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Vehicles ({(assets.vehicles || []).length})</h2>
          </div>
          <span className="text-lg font-bold text-green-600">{formatCurrency(vehicleTotal)}</span>
        </div>
        {(assets.vehicles || []).length === 0 ? (
          <p className="text-gray-500">No vehicles listed</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Vehicle</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">VIN</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">License</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(assets.vehicles || []).map((vehicle, index) => (
                  <tr key={vehicle.id || index}>
                    <td className="px-4 py-2 font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</td>
                    <td className="px-4 py-2">{vehicle.vin || '-'}</td>
                    <td className="px-4 py-2">{vehicle.licensePlate || '-'}</td>
                    <td className="px-4 py-2 text-right text-green-600 font-medium">{formatCurrency(vehicle.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Personal Property */}
      {(assets.personalProperty || []).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-blue-900 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Property ({(assets.personalProperty || []).length})</h2>
            </div>
            <span className="text-lg font-bold text-green-600">{formatCurrency(personalTotal)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Description</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(assets.personalProperty || []).map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-4 py-2 font-medium">{item.description || '-'}</td>
                    <td className="px-4 py-2 text-right text-green-600 font-medium">{formatCurrency(item.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Liabilities */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-blue-900 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Liabilities ({liabilities.length})</h2>
          </div>
          <span className="text-lg font-bold text-red-600">{formatCurrency(totalLiabilities)}</span>
        </div>
        {liabilities.length === 0 ? (
          <p className="text-gray-500">No liabilities listed</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Creditor</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Account</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {liabilities.map((liability, index) => (
                  <tr key={liability.id || index}>
                    <td className="px-4 py-2 font-medium">{liability.creditor || '-'}</td>
                    <td className="px-4 py-2">{liability.type || '-'}</td>
                    <td className="px-4 py-2">{liability.accountNumber || '-'}</td>
                    <td className="px-4 py-2 text-right text-red-600 font-medium">{formatCurrency(liability.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documents */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-blue-900 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Uploaded Documents ({documents.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">File Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Category</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Uploaded</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-2 font-medium">{doc.fileName || '-'}</td>
                    <td className="px-4 py-2">{doc.category || '-'}</td>
                    <td className="px-4 py-2">{formatDate(doc.uploadedAt)}</td>
                    <td className="px-4 py-2 print:hidden">
                      {doc.downloadURL && (
                        <a
                          href={doc.downloadURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Information */}
      {caseData.payment && (
        <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-blue-900 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="font-medium capitalize">{caseData.payment.plan || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">{formatCurrency(caseData.payment.amount || caseData.payment.totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                caseData.payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {caseData.payment.status === 'paid' ? (
                  <><Check className="h-3 w-3 mr-1" /> Paid</>
                ) : (
                  <><Clock className="h-3 w-3 mr-1" /> {caseData.payment.status || 'Pending'}</>
                )}
              </span>
            </div>
            {caseData.payment.paidAt && (
              <div>
                <p className="text-sm text-gray-500">Paid On</p>
                <p className="font-medium">{formatDate(caseData.payment.paidAt)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estate Summary */}
      <div className="bg-blue-50 rounded-xl p-6 print:bg-gray-100 print:break-inside-avoid">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estate Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Assets</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAssets)}</p>
            <div className="text-xs text-gray-400 mt-2">
              <div className="flex justify-between">
                <span>Real Property:</span>
                <span>{formatCurrency(realPropertyTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bank Accounts:</span>
                <span>{formatCurrency(bankTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Investments:</span>
                <span>{formatCurrency(investmentTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicles:</span>
                <span>{formatCurrency(vehicleTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Personal Property:</span>
                <span>{formatCurrency(personalTotal)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Liabilities</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-500">Net Estate Value</p>
            <p className={`text-2xl font-bold ${netEstate >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
              {formatCurrency(netEstate)}
            </p>
          </div>
        </div>
      </div>

      {/* Key Dates */}
      {caseData.keyDates && (
        <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-blue-900 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Key Dates</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {caseData.keyDates.intakeCompleted && (
              <div>
                <p className="text-sm text-gray-500">Intake Completed</p>
                <p className="font-medium">{new Date(caseData.keyDates.intakeCompleted).toLocaleDateString()}</p>
              </div>
            )}
            {caseData.keyDates.petitionFiled && (
              <div>
                <p className="text-sm text-gray-500">Petition Filed</p>
                <p className="font-medium">{new Date(caseData.keyDates.petitionFiled).toLocaleDateString()}</p>
              </div>
            )}
            {caseData.keyDates.firstHearing && (
              <div>
                <p className="text-sm text-gray-500">First Hearing</p>
                <p className="font-medium">{new Date(caseData.keyDates.firstHearing).toLocaleDateString()}</p>
              </div>
            )}
            {caseData.keyDates.lettersIssued && (
              <div>
                <p className="text-sm text-gray-500">Letters Issued</p>
                <p className="font-medium">{new Date(caseData.keyDates.lettersIssued).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Generator Modal */}
      {showFormGenerator && (
        <FormGenerator
          caseData={caseData}
          onClose={() => setShowFormGenerator(false)}
        />
      )}
    </div>
  );
};

export default AdminCaseDetails;
