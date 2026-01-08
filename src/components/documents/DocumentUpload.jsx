import React, { useState, useRef, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  CloudUpload
} from 'lucide-react';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DOCUMENT_CATEGORIES = [
  { id: 'death-certificate', label: 'Death Certificate' },
  { id: 'will', label: 'Will' },
  { id: 'codicil', label: 'Codicil' },
  { id: 'property-deed', label: 'Property Deed' },
  { id: 'vehicle-title', label: 'Vehicle Title' },
  { id: 'bank-statement', label: 'Bank Statement' },
  { id: 'investment-statement', label: 'Investment Statement' },
  { id: 'insurance-policy', label: 'Insurance Policy' },
  { id: 'debt-statement', label: 'Debt/Credit Statement' },
  { id: 'id-document', label: 'ID Document' },
  { id: 'court-document', label: 'Court Document' },
  { id: 'other', label: 'Other' }
];

const DocumentUpload = ({ caseId, onUploadComplete, selectedCategory }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState(selectedCategory || '');
  const [notes, setNotes] = useState('');

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'File type not allowed. Please upload PDF, images, or Word documents.' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 10MB limit.' };
    }
    return { valid: true };
  };

  const handleFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    const processedFiles = fileArray.map((file) => {
      const validation = validateFile(file);
      return {
        file,
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: validation.valid ? 'pending' : 'error',
        error: validation.error || null,
        progress: 0
      };
    });
    setFiles((prev) => [...prev, ...processedFiles]);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const uploadFile = async (fileData) => {
    const { file, id } = fileData;
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `cases/${caseId}/documents/${fileName}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, progress, status: 'uploading' } : f
            )
          );
        },
        (error) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, status: 'error', error: error.message } : f
            )
          );
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save document metadata to Firestore
            const docData = {
              caseId,
              userId: user.uid,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              storagePath,
              downloadURL,
              category: category || 'other',
              notes: notes || '',
              uploadedAt: serverTimestamp(),
              status: 'active'
            };

            const docRef = await addDoc(collection(db, 'documents'), docData);

            setFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, status: 'complete', progress: 100, docId: docRef.id } : f
              )
            );

            resolve({ ...docData, id: docRef.id });
          } catch (error) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, status: 'error', error: error.message } : f
              )
            );
            reject(error);
          }
        }
      );
    });
  };

  const handleUpload = async () => {
    if (!category) {
      alert('Please select a document category');
      return;
    }

    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploading(true);

    try {
      const results = await Promise.allSettled(
        pendingFiles.map((f) => uploadFile(f))
      );

      const successfulUploads = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value);

      if (onUploadComplete && successfulUploads.length > 0) {
        onUploadComplete(successfulUploads);
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const hasErrors = files.some((f) => f.status === 'error');

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Category <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          disabled={uploading}
        >
          <option value="">Select category</option>
          {DOCUMENT_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about these documents"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          disabled={uploading}
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
          disabled={uploading}
        />
        <CloudUpload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-gray-600 font-medium">
          {isDragging ? 'Drop files here' : 'Drag and drop files here, or click to browse'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          PDF, images, or Word documents up to 10MB each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Selected Files</h4>
          {files.map((fileData) => (
            <div
              key={fileData.id}
              className={`flex items-center p-3 rounded-lg ${
                fileData.status === 'error'
                  ? 'bg-red-50'
                  : fileData.status === 'complete'
                  ? 'bg-green-50'
                  : 'bg-gray-50'
              }`}
            >
              <FileText className={`h-5 w-5 mr-3 ${
                fileData.status === 'error'
                  ? 'text-red-500'
                  : fileData.status === 'complete'
                  ? 'text-green-500'
                  : 'text-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileData.name}
                </p>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">
                    {formatFileSize(fileData.size)}
                  </span>
                  {fileData.status === 'uploading' && (
                    <div className="ml-3 flex-1 max-w-xs">
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${fileData.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {fileData.error && (
                    <span className="ml-2 text-xs text-red-600">{fileData.error}</span>
                  )}
                </div>
              </div>
              <div className="ml-3">
                {fileData.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileData.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                    disabled={uploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {fileData.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                )}
                {fileData.status === 'complete' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {fileData.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {pendingCount > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading || !category}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
            uploading || !category
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-900 text-white hover:bg-blue-800'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Upload {pendingCount} File{pendingCount !== 1 ? 's' : ''}
            </>
          )}
        </button>
      )}

      {/* Error warning */}
      {hasErrors && !uploading && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          Some files could not be uploaded. Please check the errors above.
        </p>
      )}
    </div>
  );
};

export { DOCUMENT_CATEGORIES };
export default DocumentUpload;
