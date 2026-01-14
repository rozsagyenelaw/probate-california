import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, where, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { extractTextFromPDF } from '../../utils/pdfExtractor';
import {
  Search,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
  Building,
  Landmark,
  PiggyBank,
  Home,
  Briefcase,
  Shield,
  Car,
  HelpCircle,
  Upload,
  FolderOpen,
  X
} from 'lucide-react';

const DOCUMENT_TYPE_MAP = {
  'tax-return': 'Tax Return',
  'bank-statement': 'Bank Statement',
  'investment-statement': 'Investment Statement',
  'retirement-statement': 'Retirement Account Statement',
  'property-document': 'Property Document',
  'insurance-document': 'Life Insurance Document',
  'financial': 'Financial Document',
  'other': 'Other Document'
};

const FINANCIAL_CATEGORIES = [
  { id: 'tax-return', label: 'Tax Return (1040, etc.)' },
  { id: 'bank-statement', label: 'Bank Statement' },
  { id: 'investment-statement', label: 'Investment/Brokerage Statement' },
  { id: 'retirement-statement', label: 'Retirement Account (401k, IRA)' },
  { id: 'property-document', label: 'Property Tax Bill / Assessment' },
  { id: 'insurance-document', label: 'Life Insurance Statement' },
  { id: 'financial', label: 'Other Financial Document' }
];

const ASSET_ICONS = {
  'Bank Account': Landmark,
  'Investment': Building,
  'Retirement': PiggyBank,
  'Real Estate': Home,
  'Business': Briefcase,
  'Life Insurance': Shield,
  'Vehicle': Car,
  'Other': HelpCircle
};

const AdminAssetDiscoveryPage = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState(null);
  const [expandedAssets, setExpandedAssets] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upload state
  const fileInputRef = useRef(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load all cases
  useEffect(() => {
    const loadCases = async () => {
      try {
        const casesQuery = query(
          collection(db, 'cases'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(casesQuery);
        const casesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setCases(casesData);
      } catch (err) {
        console.error('Error loading cases:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCases();
  }, []);

  // Load documents when case is selected
  useEffect(() => {
    if (!selectedCase) {
      setDocuments([]);
      setResults(null);
      return;
    }

    const loadDocuments = async () => {
      try {
        const docsQuery = query(
          collection(db, 'documents'),
          where('caseId', '==', selectedCase.id)
        );
        const snapshot = await getDocs(docsQuery);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Filter to financial documents
        const financialDocs = docs.filter(d =>
          d.category === 'financial' ||
          d.category === 'tax-return' ||
          d.category === 'bank-statement' ||
          d.category === 'investment-statement' ||
          d.category === 'retirement-statement' ||
          d.category === 'property-document' ||
          d.category === 'insurance-document' ||
          d.subcategory === 'asset-discovery' ||
          d.fileName?.toLowerCase().includes('tax') ||
          d.fileName?.toLowerCase().includes('statement') ||
          d.fileName?.toLowerCase().includes('1099') ||
          d.fileName?.toLowerCase().includes('w-2')
        );
        console.log('Initial load - all docs:', docs.length, 'financial docs:', financialDocs.length);

        setDocuments(financialDocs);
        setSelectedDocs(financialDocs.map(d => d.id));

        // Load existing results
        if (selectedCase.assetDiscovery) {
          setResults(selectedCase.assetDiscovery);
        } else {
          setResults(null);
        }
      } catch (err) {
        console.error('Error loading documents:', err);
      }
    };

    loadDocuments();
  }, [selectedCase]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf');

    if (pdfFiles.length !== selectedFiles.length) {
      alert('Please upload PDF files only.');
    }

    setUploadFiles(pdfFiles.map(file => ({
      file,
      name: file.name,
      status: 'pending',
      progress: 0
    })));
  };

  const handleUpload = async () => {
    if (!selectedCase || !uploadCategory || uploadFiles.length === 0) return;

    setUploading(true);

    for (let i = 0; i < uploadFiles.length; i++) {
      const fileData = uploadFiles[i];
      const file = fileData.file;

      try {
        setUploadFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading' } : f
        ));

        const storageRef = ref(storage, `documents/${selectedCase.id}/financial/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, progress } : f
              ));
            },
            reject,
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Save to Firestore
              const { addDoc } = await import('firebase/firestore');
              await addDoc(collection(db, 'documents'), {
                caseId: selectedCase.id,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                category: uploadCategory,
                subcategory: 'asset-discovery',
                downloadURL,
                status: 'active',
                uploadedAt: Timestamp.now(),
                source: 'admin-upload'
              });

              setUploadFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'complete', progress: 100 } : f
              ));

              resolve();
            }
          );
        });
      } catch (error) {
        console.error('Upload error:', error);
        setUploadFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'error' } : f
        ));
      }
    }

    setUploading(false);

    // Reset upload form first
    setUploadFiles([]);
    setUploadCategory('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Small delay to ensure Firestore has committed, then reload documents
    setTimeout(async () => {
      try {
        const docsQuery = query(
          collection(db, 'documents'),
          where('caseId', '==', selectedCase.id)
        );
        const snapshot = await getDocs(docsQuery);
        console.log('Reloaded documents count:', snapshot.size);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log('All docs for case:', docs);
        const financialDocs = docs.filter(d =>
          d.category === 'financial' ||
          d.category === 'tax-return' ||
          d.category === 'bank-statement' ||
          d.category === 'investment-statement' ||
          d.category === 'retirement-statement' ||
          d.category === 'property-document' ||
          d.category === 'insurance-document' ||
          d.subcategory === 'asset-discovery'
        );
        console.log('Financial docs:', financialDocs);
        setDocuments(financialDocs);
        setSelectedDocs(financialDocs.map(d => d.id));
      } catch (err) {
        console.error('Error reloading documents:', err);
      }
    }, 1000);
  };

  const toggleDocSelection = (docId) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const runAnalysis = async () => {
    if (selectedDocs.length === 0) {
      setError('Please select at least one document to analyze');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResults(null);

    const allAssets = [];
    const documentSummaries = [];

    try {
      const docsToAnalyze = documents.filter(d => selectedDocs.includes(d.id));

      for (let i = 0; i < docsToAnalyze.length; i++) {
        const docItem = docsToAnalyze[i];
        setProgress(`Processing ${i + 1}/${docsToAnalyze.length}: ${docItem.fileName}`);

        if (!docItem.downloadURL) {
          console.warn(`No download URL for ${docItem.fileName}`);
          continue;
        }

        try {
          const response = await fetch(docItem.downloadURL);
          const blob = await response.blob();
          const file = new File([blob], docItem.fileName, { type: 'application/pdf' });

          setProgress(`Extracting text from ${docItem.fileName}...`);
          const pdfText = await extractTextFromPDF(file);

          setProgress(`Analyzing ${docItem.fileName} with AI...`);
          const aiResponse = await fetch('/.netlify/functions/analyze-tax-returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentText: pdfText,
              documentType: DOCUMENT_TYPE_MAP[docItem.category] || 'Financial Document',
              documentName: docItem.fileName
            })
          });

          if (!aiResponse.ok) {
            console.error(`Failed to analyze ${docItem.fileName}`);
            continue;
          }

          const result = await aiResponse.json();

          if (result.success && result.analysis) {
            documentSummaries.push({
              documentId: docItem.id,
              fileName: docItem.fileName,
              ...result.analysis.documentSummary
            });

            if (result.analysis.assets) {
              allAssets.push(...result.analysis.assets.map(asset => ({
                ...asset,
                sourceDocument: docItem.fileName,
                sourceDocumentId: docItem.id
              })));
            }
          }
        } catch (docError) {
          console.error(`Error processing ${docItem.fileName}:`, docError);
        }
      }

      const deduplicatedAssets = deduplicateAssets(allAssets);

      const finalResults = {
        consolidatedAssets: deduplicatedAssets,
        documentSummaries,
        totalUniqueAssets: deduplicatedAssets.length,
        documentsAnalyzed: docsToAnalyze.length,
        analysisDate: new Date().toISOString(),
        recommendations: generateRecommendations(deduplicatedAssets)
      };

      setResults(finalResults);
      setProgress('');

      await saveResultsToCase(finalResults);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze documents');
      setProgress('');
    } finally {
      setAnalyzing(false);
    }
  };

  const deduplicateAssets = (assets) => {
    const assetMap = new Map();

    assets.forEach(asset => {
      const key = `${asset.type}-${asset.institution}-${asset.accountNumber || ''}`.toLowerCase();

      if (assetMap.has(key)) {
        const existing = assetMap.get(key);
        existing.sourceDocuments = [...new Set([...existing.sourceDocuments, asset.sourceDocument])];
        if (asset.estimatedValue && !existing.estimatedValue) {
          existing.estimatedValue = asset.estimatedValue;
        }
      } else {
        assetMap.set(key, {
          ...asset,
          sourceDocuments: [asset.sourceDocument]
        });
      }
    });

    return Array.from(assetMap.values());
  };

  const generateRecommendations = (assets) => {
    const recommendations = [];
    const types = [...new Set(assets.map(a => a.type))];

    if (types.includes('Bank Account')) {
      recommendations.push('Contact all banks to obtain date-of-death balances and account status.');
    }
    if (types.includes('Investment')) {
      recommendations.push('Request cost basis reports from all brokerage firms for tax purposes.');
    }
    if (types.includes('Retirement')) {
      recommendations.push('Verify beneficiary designations on all retirement accounts - these pass outside probate.');
    }
    if (types.includes('Real Estate')) {
      recommendations.push('Order preliminary title reports for all real property.');
    }
    if (types.includes('Life Insurance')) {
      recommendations.push('File death claims with all life insurance companies immediately.');
    }
    if (types.includes('Business')) {
      recommendations.push('Review business agreements for buy-sell provisions and valuation methods.');
    }

    return recommendations;
  };

  const saveResultsToCase = async (resultsData) => {
    if (!selectedCase) return;
    try {
      const caseRef = doc(db, 'cases', selectedCase.id);
      await updateDoc(caseRef, {
        assetDiscovery: {
          ...resultsData,
          savedAt: Timestamp.now(),
          savedBy: 'admin'
        },
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error saving results:', err);
    }
  };

  const toggleAsset = (index) => {
    setExpandedAssets(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const downloadReport = () => {
    if (!results || !selectedCase) return;

    let report = `ASSET DISCOVERY REPORT\n`;
    report += `Case: ${selectedCase.estateName || 'Unknown'}\n`;
    report += `Generated: ${new Date().toLocaleDateString()}\n`;
    report += `========================================\n\n`;
    report += `SUMMARY\n`;
    report += `Documents Analyzed: ${results.documentsAnalyzed}\n`;
    report += `Unique Assets Found: ${results.totalUniqueAssets}\n\n`;
    report += `ASSETS IDENTIFIED\n`;
    report += `----------------------------------------\n`;

    results.consolidatedAssets.forEach((asset, i) => {
      report += `\n${i + 1}. ${asset.type.toUpperCase()}\n`;
      report += `   Institution: ${asset.institution}\n`;
      if (asset.accountNumber) report += `   Account: ${asset.accountNumber}\n`;
      report += `   Description: ${asset.description}\n`;
      if (asset.estimatedValue) report += `   Value: ${asset.estimatedValue}\n`;
      report += `   Action: ${asset.actionRequired}\n`;
      report += `   Source: ${asset.sourceDocuments?.join(', ')}\n`;
    });

    report += `\nRECOMMENDATIONS\n`;
    report += `----------------------------------------\n`;
    results.recommendations.forEach((rec, i) => {
      report += `${i + 1}. ${rec}\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Asset-Discovery-${selectedCase.estateName || 'Report'}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const AssetIcon = ({ type }) => {
    const Icon = ASSET_ICONS[type] || HelpCircle;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Asset Discovery</h1>
          <p className="text-gray-600">Analyze financial documents to discover estate assets</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Case Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
              Select Case
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cases.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedCase?.id === c.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-gray-900">{c.estateName || 'Unnamed Estate'}</p>
                  <p className="text-sm text-gray-500">{c.petitioner?.name || 'No petitioner'}</p>
                  {c.assetDiscovery && (
                    <span className="inline-flex items-center text-xs text-green-600 mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Analysis done
                    </span>
                  )}
                </button>
              ))}
              {cases.length === 0 && (
                <p className="text-gray-500 text-center py-4">No cases found</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedCase ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Select a Case</h3>
              <p className="text-gray-500 mt-2">Choose a case from the left to view and analyze financial documents</p>
            </div>
          ) : (
            <>
              {/* Upload Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-green-600" />
                  Upload Documents for {selectedCase.estateName}
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      disabled={uploading}
                    >
                      <option value="">Select type...</option>
                      {FINANCIAL_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Files</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf"
                      multiple
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      disabled={uploading}
                    />
                  </div>
                </div>

                {uploadFiles.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {uploadFiles.map((f, idx) => (
                      <div key={idx} className={`flex items-center p-2 rounded-lg border ${
                        f.status === 'complete' ? 'bg-green-50 border-green-200' :
                        f.status === 'error' ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="flex-1 text-sm truncate">{f.name}</span>
                        {f.status === 'uploading' && (
                          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                        )}
                        {f.status === 'complete' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {f.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadCategory || uploadFiles.length === 0}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload to Case
                    </>
                  )}
                </button>
              </div>

              {/* Document Selection & Analysis */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Search className="h-5 w-5 mr-2 text-blue-600" />
                    Analyze Documents ({documents.length} available)
                  </h3>
                  {results && (
                    <button
                      onClick={downloadReport}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Report
                    </button>
                  )}
                </div>

                {/* Always show document list */}
                {documents.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No financial documents for this case yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Upload documents above to get started.</p>
                  </div>
                ) : (
                  <>
                    <div className="border rounded-lg divide-y max-h-64 overflow-y-auto mb-4">
                      {documents.map(docItem => (
                        <label
                          key={docItem.id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(docItem.id)}
                            onChange={() => toggleDocSelection(docItem.id)}
                            className="h-4 w-4 text-blue-600 rounded"
                            disabled={analyzing}
                          />
                          <FileText className="h-4 w-4 text-gray-400 ml-3 mr-2" />
                          <span className="flex-1 text-sm">{docItem.fileName}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {DOCUMENT_TYPE_MAP[docItem.category] || docItem.category || 'Document'}
                          </span>
                        </label>
                      ))}
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {error}
                      </div>
                    )}

                    {progress && (
                      <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-4 flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {progress}
                      </div>
                    )}

                    <button
                      onClick={() => { setResults(null); }}
                      className={`w-full mb-2 py-2 rounded-lg font-medium flex items-center justify-center ${
                        results ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'hidden'
                      }`}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Results & Re-analyze
                    </button>

                    <button
                      onClick={runAnalysis}
                      disabled={analyzing || selectedDocs.length === 0}
                      className="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          {results ? 'Run New Analysis' : 'Run AI Asset Discovery'} ({selectedDocs.length} documents)
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* Results */}
                {results && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Assets Discovered</p>
                        <p className="text-2xl font-bold text-blue-900">{results.totalUniqueAssets}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600">Documents Analyzed</p>
                        <p className="text-2xl font-bold text-blue-900">{results.documentsAnalyzed}</p>
                      </div>
                      <button
                        onClick={() => setResults(null)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Re-analyze
                      </button>
                    </div>

                    {results.consolidatedAssets.length > 0 ? (
                      <div className="border rounded-lg divide-y">
                        {results.consolidatedAssets.map((asset, index) => (
                          <div key={index} className="p-3">
                            <div
                              className="flex items-center cursor-pointer"
                              onClick={() => toggleAsset(index)}
                            >
                              <div className={`p-2 rounded-lg mr-3 ${
                                asset.type === 'Life Insurance' || asset.type === 'Retirement'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                <AssetIcon type={asset.type} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{asset.institution}</p>
                                <p className="text-sm text-gray-500">{asset.type}</p>
                              </div>
                              {asset.estimatedValue && (
                                <span className="text-green-600 font-medium mr-3">
                                  {asset.estimatedValue}
                                </span>
                              )}
                              {expandedAssets[index] ? (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}
                            </div>

                            {expandedAssets[index] && (
                              <div className="mt-3 pl-12 space-y-2 text-sm">
                                {asset.accountNumber && (
                                  <p><span className="text-gray-500">Account:</span> {asset.accountNumber}</p>
                                )}
                                <p><span className="text-gray-500">Description:</span> {asset.description}</p>
                                <p className="bg-gray-50 p-2 rounded italic text-gray-600">
                                  Evidence: "{asset.evidence}"
                                </p>
                                <p className="text-blue-700">
                                  <span className="text-gray-500">Action:</span> {asset.actionRequired}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Source: {asset.sourceDocuments?.join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-600">No assets identified from the analyzed documents.</p>
                      </div>
                    )}

                    {results.recommendations.length > 0 && (
                      <div className="bg-amber-50 rounded-lg p-4">
                        <h4 className="font-medium text-amber-800 mb-2">Recommended Actions</h4>
                        <ul className="space-y-1">
                          {results.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-amber-700 flex items-start">
                              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 text-center">
                      Analysis performed on {new Date(results.analysisDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssetDiscoveryPage;
