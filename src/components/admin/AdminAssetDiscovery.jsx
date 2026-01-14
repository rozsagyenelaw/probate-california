import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
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
  HelpCircle
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

const AdminAssetDiscovery = ({ caseId, caseData }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState(null);
  const [expandedAssets, setExpandedAssets] = useState({});
  const [error, setError] = useState(null);

  // Load existing results from case data
  useEffect(() => {
    if (caseData?.assetDiscovery) {
      setResults(caseData.assetDiscovery);
    }
  }, [caseData]);

  // Load financial documents for this case
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docsQuery = query(
          collection(db, 'documents'),
          where('caseId', '==', caseId)
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
          d.fileName?.toLowerCase().includes('tax') ||
          d.fileName?.toLowerCase().includes('statement') ||
          d.fileName?.toLowerCase().includes('1099') ||
          d.fileName?.toLowerCase().includes('w-2')
        );

        setDocuments(financialDocs);
        // Auto-select all financial documents
        setSelectedDocs(financialDocs.map(d => d.id));
      } catch (err) {
        console.error('Error loading documents:', err);
      }
    };

    if (caseId) {
      loadDocuments();
    }
  }, [caseId]);

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
        const doc = docsToAnalyze[i];
        setProgress(`Processing ${i + 1}/${docsToAnalyze.length}: ${doc.fileName}`);

        // Fetch the PDF and extract text
        if (!doc.downloadURL) {
          console.warn(`No download URL for ${doc.fileName}`);
          continue;
        }

        try {
          // Fetch the PDF file
          const response = await fetch(doc.downloadURL);
          const blob = await response.blob();
          const file = new File([blob], doc.fileName, { type: 'application/pdf' });

          // Extract text
          setProgress(`Extracting text from ${doc.fileName}...`);
          const pdfText = await extractTextFromPDF(file);

          // Send to AI for analysis
          setProgress(`Analyzing ${doc.fileName} with AI...`);
          const aiResponse = await fetch('/.netlify/functions/analyze-tax-returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentText: pdfText,
              documentType: DOCUMENT_TYPE_MAP[doc.category] || 'Financial Document',
              documentName: doc.fileName
            })
          });

          if (!aiResponse.ok) {
            console.error(`Failed to analyze ${doc.fileName}`);
            continue;
          }

          const result = await aiResponse.json();

          if (result.success && result.analysis) {
            documentSummaries.push({
              documentId: doc.id,
              fileName: doc.fileName,
              ...result.analysis.documentSummary
            });

            if (result.analysis.assets) {
              allAssets.push(...result.analysis.assets.map(asset => ({
                ...asset,
                sourceDocument: doc.fileName,
                sourceDocumentId: doc.id
              })));
            }
          }
        } catch (docError) {
          console.error(`Error processing ${doc.fileName}:`, docError);
        }
      }

      // Deduplicate assets
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

      // Save to case
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

  const saveResultsToCase = async (results) => {
    try {
      const caseRef = doc(db, 'cases', caseId);
      await updateDoc(caseRef, {
        assetDiscovery: {
          ...results,
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
    if (!results) return;

    let report = `ASSET DISCOVERY REPORT\n`;
    report += `Case: ${caseData?.estateName || 'Unknown'}\n`;
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
    a.download = `Asset-Discovery-${caseData?.estateName || 'Report'}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const AssetIcon = ({ type }) => {
    const Icon = ASSET_ICONS[type] || HelpCircle;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Search className="h-5 w-5 text-blue-900 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">AI Asset Discovery</h2>
        </div>
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

      {/* Document Selection */}
      {!results && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Select financial documents to analyze for potential assets. The AI will extract account information, balances, and asset details.
          </p>

          {documents.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No financial documents uploaded yet.</p>
              <p className="text-sm text-gray-500 mt-1">
                Ask the client to upload tax returns, bank statements, and other financial documents.
              </p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto mb-4">
                {documents.map(doc => (
                  <label
                    key={doc.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleDocSelection(doc.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                      disabled={analyzing}
                    />
                    <FileText className="h-4 w-4 text-gray-400 ml-3 mr-2" />
                    <span className="flex-1 text-sm">{doc.fileName}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {DOCUMENT_TYPE_MAP[doc.category] || doc.category || 'Document'}
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
                    Run AI Asset Discovery ({selectedDocs.length} documents)
                  </>
                )}
              </button>
            </>
          )}
        </>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Summary */}
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

          {/* Assets List */}
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

          {/* Recommendations */}
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
  );
};

export default AdminAssetDiscovery;
