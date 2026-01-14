import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Upload,
  X,
  CheckCircle,
  Loader2,
  Search,
  AlertCircle
} from 'lucide-react';

const FINANCIAL_CATEGORIES = [
  { id: 'tax-return', label: 'Tax Return (1040, etc.)' },
  { id: 'bank-statement', label: 'Bank Statement' },
  { id: 'investment-statement', label: 'Investment/Brokerage Statement' },
  { id: 'retirement-statement', label: 'Retirement Account (401k, IRA)' },
  { id: 'property-document', label: 'Property Tax Bill / Assessment' },
  { id: 'insurance-document', label: 'Life Insurance Statement' },
  { id: 'financial', label: 'Other Financial Document' }
];

const FinancialDocsUpload = ({ caseId }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf');

    if (pdfFiles.length !== selectedFiles.length) {
      alert('Please upload PDF files only for financial documents.');
    }

    setFiles(pdfFiles.map(file => ({
      file,
      name: file.name,
      status: 'pending',
      progress: 0
    })));
    setSuccess(false);
  };

  const uploadFiles = async () => {
    if (!category) {
      alert('Please select a document type');
      return;
    }

    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      const file = fileData.file;

      try {
        // Update status
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading' } : f
        ));

        // Upload to Firebase Storage
        const storageRef = ref(storage, `documents/${caseId}/financial/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, progress } : f
              ));
            },
            reject,
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Save to Firestore
              await addDoc(collection(db, 'documents'), {
                caseId,
                userId: user.uid,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                category,
                subcategory: 'asset-discovery',
                downloadURL,
                status: 'active',
                uploadedAt: serverTimestamp(),
                source: 'client-upload'
              });

              setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'complete', progress: 100 } : f
              ));

              resolve();
            }
          );
        });
      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'error' } : f
        ));
      }
    }

    setUploading(false);
    setSuccess(true);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFiles([]);
    setCategory('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
      <div className="flex items-start mb-4">
        <div className="bg-blue-100 rounded-lg p-2 mr-3">
          <Search className="h-5 w-5 text-blue-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Financial Documents for Asset Discovery</h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload tax returns, bank statements, and other financial documents so we can identify all estate assets.
          </p>
        </div>
      </div>

      {success ? (
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
          <p className="font-medium text-green-800">Documents uploaded successfully!</p>
          <p className="text-sm text-green-600 mt-1">We'll analyze these for potential assets.</p>
          <button
            onClick={resetForm}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Upload more documents
          </button>
        </div>
      ) : (
        <>
          {/* Category Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={uploading}
            >
              <option value="">Select document type...</option>
              {FINANCIAL_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* File Input */}
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf"
              multiple
              className="hidden"
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
              disabled={uploading}
            >
              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to select PDF files</p>
            </button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-4 space-y-2">
              {files.map((fileData, index) => (
                <div
                  key={index}
                  className={`flex items-center p-2 rounded-lg ${
                    fileData.status === 'complete' ? 'bg-green-50' :
                    fileData.status === 'error' ? 'bg-red-50' :
                    fileData.status === 'uploading' ? 'bg-blue-50' : 'bg-white'
                  } border`}
                >
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="flex-1 text-sm truncate">{fileData.name}</span>

                  {fileData.status === 'uploading' && (
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${fileData.progress}%` }}
                        />
                      </div>
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    </div>
                  )}

                  {fileData.status === 'complete' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}

                  {fileData.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}

                  {fileData.status === 'pending' && (
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Validation Message */}
          {files.length > 0 && !category && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-amber-700">Please select a document type above to continue</span>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0 || !category}
            className="w-full bg-blue-900 text-white py-2 rounded-lg font-medium hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : !category && files.length > 0 ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Select Document Type First
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </>
            )}
          </button>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-3 text-center">
            Accepted: PDF files up to 10MB each
          </p>
        </>
      )}
    </div>
  );
};

export default FinancialDocsUpload;
