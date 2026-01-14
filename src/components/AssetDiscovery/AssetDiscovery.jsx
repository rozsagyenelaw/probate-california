import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { extractTextFromPDF } from '../../utils/pdfExtractor';
import AssetReport from './AssetReport';
import './AssetDiscovery.css';

const AssetDiscovery = ({ caseId, onComplete }) => {
  const [uploads, setUploads] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');

    const newUploads = pdfFiles.map(file => ({
      file,
      name: file.name,
      year: extractYearFromFilename(file.name) || 'Unknown',
      status: 'pending'
    }));

    setUploads(prev => [...prev, ...newUploads]);
    setError(null);
  }, []);

  const extractYearFromFilename = (filename) => {
    const yearMatch = filename.match(/(20\d{2})/);
    return yearMatch ? yearMatch[1] : null;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeUpload = (index) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const updateUploadYear = (index, year) => {
    setUploads(prev => prev.map((upload, i) =>
      i === index ? { ...upload, year } : upload
    ));
  };

  const analyzeReturns = async () => {
    if (uploads.length === 0) {
      setError('Please upload at least one tax return');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResults(null);

    const allAssets = [];
    const analysisResults = [];

    try {
      for (let i = 0; i < uploads.length; i++) {
        const upload = uploads[i];
        setProgress(`Extracting text from ${upload.name}...`);

        // Update status
        setUploads(prev => prev.map((u, idx) =>
          idx === i ? { ...u, status: 'extracting' } : u
        ));

        // Extract text from PDF
        const pdfText = await extractTextFromPDF(upload.file);

        setProgress(`Analyzing ${upload.year} tax return with AI...`);

        // Update status
        setUploads(prev => prev.map((u, idx) =>
          idx === i ? { ...u, status: 'analyzing' } : u
        ));

        // Send to AI for analysis
        const response = await fetch('/.netlify/functions/analyze-tax-returns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            taxReturnText: pdfText,
            year: upload.year
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to analyze ${upload.name}`);
        }

        const result = await response.json();

        // Update status
        setUploads(prev => prev.map((u, idx) =>
          idx === i ? { ...u, status: 'complete' } : u
        ));

        if (result.success && result.analysis) {
          analysisResults.push({
            year: upload.year,
            filename: upload.name,
            ...result.analysis
          });

          if (result.analysis.assets) {
            allAssets.push(...result.analysis.assets.map(asset => ({
              ...asset,
              sourceYear: upload.year
            })));
          }
        }
      }

      // Deduplicate assets (same institution appearing in multiple years)
      const deduplicatedAssets = deduplicateAssets(allAssets);

      const finalResults = {
        analyzedReturns: analysisResults,
        consolidatedAssets: deduplicatedAssets,
        totalUniqueAssets: deduplicatedAssets.length,
        analysisDate: new Date().toISOString(),
        recommendations: generateRecommendations(deduplicatedAssets)
      };

      setResults(finalResults);
      setProgress('');

      // Save results to Firebase
      if (caseId && db) {
        await saveResultsToCase(caseId, finalResults);
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze tax returns');
      setProgress('');
    } finally {
      setAnalyzing(false);
    }
  };

  const deduplicateAssets = (assets) => {
    const assetMap = new Map();

    assets.forEach(asset => {
      const key = `${asset.type}-${asset.institution}`.toLowerCase();

      if (assetMap.has(key)) {
        // Merge information from multiple years
        const existing = assetMap.get(key);
        existing.yearsFound = [...new Set([...existing.yearsFound, asset.sourceYear])];
        if (asset.estimatedValue && !existing.estimatedValue) {
          existing.estimatedValue = asset.estimatedValue;
        }
      } else {
        assetMap.set(key, {
          ...asset,
          yearsFound: [asset.sourceYear]
        });
      }
    });

    return Array.from(assetMap.values());
  };

  const generateRecommendations = (assets) => {
    const recommendations = [];

    const hasRetirement = assets.some(a => a.type === 'Retirement');
    const hasRealEstate = assets.some(a => a.type === 'Real Estate');
    const hasBusiness = assets.some(a => a.type === 'Business');
    const hasLifeInsurance = assets.some(a => a.type === 'Life Insurance');

    if (hasRetirement) {
      recommendations.push('Contact all retirement account custodians to determine beneficiary designations and current values.');
    }
    if (hasRealEstate) {
      recommendations.push('Order property profiles for all real estate to confirm ownership and current valuations.');
    }
    if (hasBusiness) {
      recommendations.push('Review business agreements, operating agreements, and any buy-sell provisions.');
    }
    if (hasLifeInsurance) {
      recommendations.push('Contact insurance companies to file claims and determine policy values.');
    }
    if (assets.length > 0) {
      recommendations.push('Request statements from all financial institutions dated as of the date of death.');
    }

    return recommendations;
  };

  const saveResultsToCase = async (caseId, results) => {
    try {
      const caseRef = doc(db, 'cases', caseId);
      await updateDoc(caseRef, {
        assetDiscovery: {
          ...results,
          savedAt: Timestamp.now()
        },
        'phases.inventory.assetDiscoveryComplete': true,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error saving results to case:', err);
    }
  };

  return (
    <div className="asset-discovery">
      <div className="asset-discovery-header">
        <h2>AI Asset Discovery</h2>
        <p>Upload tax returns to automatically identify potential estate assets</p>
      </div>

      {!results && (
        <>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {isDragActive ? (
                <p>Drop the tax returns here...</p>
              ) : (
                <>
                  <p><strong>Drag & drop tax returns here</strong></p>
                  <p className="dropzone-hint">or click to select PDF files</p>
                  <p className="dropzone-hint">Upload last 2-3 years for best results</p>
                </>
              )}
            </div>
          </div>

          {uploads.length > 0 && (
            <div className="uploads-list">
              <h3>Uploaded Returns</h3>
              {uploads.map((upload, index) => (
                <div key={index} className={`upload-item ${upload.status}`}>
                  <div className="upload-info">
                    <span className="upload-name">{upload.name}</span>
                    <div className="upload-year">
                      <label>Tax Year:</label>
                      <input
                        type="text"
                        value={upload.year}
                        onChange={(e) => updateUploadYear(index, e.target.value)}
                        placeholder="YYYY"
                        maxLength={4}
                        disabled={analyzing}
                      />
                    </div>
                  </div>
                  <div className="upload-status">
                    {upload.status === 'pending' && (
                      <button
                        onClick={() => removeUpload(index)}
                        className="remove-btn"
                        disabled={analyzing}
                      >
                        ✕
                      </button>
                    )}
                    {upload.status === 'extracting' && <span className="status-badge extracting">Extracting...</span>}
                    {upload.status === 'analyzing' && <span className="status-badge analyzing">Analyzing...</span>}
                    {upload.status === 'complete' && <span className="status-badge complete">Complete</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {progress && (
            <div className="progress-message">
              <div className="spinner"></div>
              {progress}
            </div>
          )}

          <div className="action-buttons">
            <button
              onClick={analyzeReturns}
              disabled={uploads.length === 0 || analyzing}
              className="analyze-btn"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Tax Returns'}
            </button>
          </div>
        </>
      )}

      {results && (
        <AssetReport
          results={results}
          onReset={() => {
            setResults(null);
            setUploads([]);
          }}
          onComplete={onComplete}
        />
      )}
    </div>
  );
};

export default AssetDiscovery;
