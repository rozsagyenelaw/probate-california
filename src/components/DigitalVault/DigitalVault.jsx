import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  doc,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { storage, db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Lock,
  Upload,
  Download,
  Trash2,
  FileText,
  Image,
  File,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Grid,
  List,
  ExternalLink,
  Shield,
  X
} from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  { id: 'probate-orders', name: 'Probate Orders', icon: '⚖️', description: 'Court orders and official documents' },
  { id: 'letters', name: 'Letters & Certificates', icon: '📜', description: 'Letters Testamentary, death certificates' },
  { id: 'inventory', name: 'Inventory & Appraisal', icon: '📋', description: 'Asset inventories and valuations' },
  { id: 'financial', name: 'Financial Documents', icon: '💰', description: 'Bank statements, tax returns, account docs' },
  { id: 'property', name: 'Property Documents', icon: '🏠', description: 'Deeds, titles, property records' },
  { id: 'estate-planning', name: 'Estate Planning', icon: '📁', description: 'Wills, trusts, powers of attorney' },
  { id: 'correspondence', name: 'Correspondence', icon: '✉️', description: 'Important letters and communications' },
  { id: 'other', name: 'Other Documents', icon: '📎', description: 'Miscellaneous important documents' }
];

const DigitalVault = ({ caseId, userId }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const effectiveUserId = userId || user?.uid;

  // Load documents from Firestore
  useEffect(() => {
    if (effectiveUserId) {
      loadDocuments();
    }
  }, [effectiveUserId, caseId]);

  const loadDocuments = async () => {
    if (!effectiveUserId) return;

    setLoading(true);
    try {
      const vaultRef = doc(db, 'vaults', effectiveUserId);
      const vaultDoc = await getDoc(vaultRef);

      if (vaultDoc.exists()) {
        const data = vaultDoc.data();
        setDocuments(data.documents || []);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error loading vault:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!selectedCategory) {
      setError('Please select a category first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of acceptedFiles) {
        // Create unique filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `vaults/${effectiveUserId}/${selectedCategory}/${timestamp}_${safeName}`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Create document record
        const docRecord = {
          id: `${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          category: selectedCategory,
          storagePath: storagePath,
          downloadURL: downloadURL,
          size: file.size,
          type: file.type,
          uploadedAt: Timestamp.now(),
          caseId: caseId || null
        };

        // Save to Firestore
        const vaultRef = doc(db, 'vaults', effectiveUserId);
        const vaultDoc = await getDoc(vaultRef);

        if (vaultDoc.exists()) {
          await updateDoc(vaultRef, {
            documents: arrayUnion(docRecord),
            updatedAt: Timestamp.now()
          });
        } else {
          // Create new vault document
          await setDoc(vaultRef, {
            userId: effectiveUserId,
            documents: [docRecord],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }

        // Update local state
        setDocuments(prev => [...prev, docRecord]);
      }

      setSuccessMessage(`${acceptedFiles.length} document(s) uploaded successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document(s)');
    } finally {
      setUploading(false);
    }
  }, [selectedCategory, effectiveUserId, caseId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: !selectedCategory || uploading
  });

  const openDeleteModal = (docRecord) => {
    setDocumentToDelete(docRecord);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  const deleteDocument = async () => {
    if (!documentToDelete) return;

    setDeleting(true);
    try {
      // Delete from Storage
      const storageRef = ref(storage, documentToDelete.storagePath);
      try {
        await deleteObject(storageRef);
      } catch (storageErr) {
        console.warn('Could not delete from storage:', storageErr);
      }

      // Remove from Firestore - need to find and remove the exact document
      const vaultRef = doc(db, 'vaults', effectiveUserId);
      const vaultDoc = await getDoc(vaultRef);

      if (vaultDoc.exists()) {
        const currentDocs = vaultDoc.data().documents || [];
        const updatedDocs = currentDocs.filter(d => d.id !== documentToDelete.id);
        await updateDoc(vaultRef, {
          documents: updatedDocs,
          updatedAt: Timestamp.now()
        });
      }

      // Update local state
      setDocuments(prev => prev.filter(d => d.id !== documentToDelete.id));

      setSuccessMessage('Document deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      closeDeleteModal();

    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return FileText;
    if (type?.includes('image')) return Image;
    return File;
  };

  const filteredDocuments = selectedCategory
    ? documents.filter(d => d.category === selectedCategory)
    : documents;

  const getDocumentCountByCategory = (categoryId) => {
    return documents.filter(d => d.category === categoryId).length;
  };

  if (!effectiveUserId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <p className="text-amber-800">Please log in to access your Digital Vault</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-blue-900" />
            <h1 className="text-2xl font-bold text-gray-900">Digital Vault</h1>
          </div>
          <p className="text-gray-500 mt-1">Securely store your important documents forever</p>
        </div>
        <div className="bg-blue-50 px-4 py-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Documents</p>
          <p className="text-2xl font-bold text-blue-900">{documents.length}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Category Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DOCUMENT_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-2">{category.icon}</span>
              <span className="text-sm font-medium text-gray-900 text-center">{category.name}</span>
              <span className="text-xs text-gray-500 mt-1">
                {getDocumentCountByCategory(category.id)} files
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            !selectedCategory
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70'
              : isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-3" />
              <p className="text-gray-600">Uploading...</p>
            </div>
          ) : !selectedCategory ? (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-3" />
              <p className="text-gray-500">Select a category above to upload documents</p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-blue-500 mb-3" />
              <p className="text-blue-600 font-medium">Drop files here...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-3" />
              <p className="text-gray-700 font-medium">Drag & drop files here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              <p className="text-sm text-blue-600 mt-2">
                Uploading to: <span className="font-medium">{DOCUMENT_CATEGORIES.find(c => c.id === selectedCategory)?.name}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedCategory
              ? DOCUMENT_CATEGORIES.find(c => c.id === selectedCategory)?.name
              : 'All Documents'}
          </h2>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No documents yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload your first document above</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map(docRecord => {
                const FileIcon = getFileIcon(docRecord.type);
                return (
                  <div key={docRecord.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 bg-gray-100 rounded-lg mb-3">
                        <FileIcon className="h-8 w-8 text-gray-600" />
                      </div>
                      <p className="font-medium text-gray-900 text-sm break-all mb-1">{docRecord.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(docRecord.size)} • {formatDate(docRecord.uploadedAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <a
                          href={docRecord.downloadURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => openDeleteModal(docRecord)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map(docRecord => {
                const FileIcon = getFileIcon(docRecord.type);
                return (
                  <div key={docRecord.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-gray-100 rounded-lg mr-4">
                      <FileIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{docRecord.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(docRecord.size)} • {formatDate(docRecord.uploadedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <a
                        href={docRecord.downloadURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                      <button
                        onClick={() => openDeleteModal(docRecord)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Estate Planning Promo */}
      <div className="mt-8 bg-gradient-to-r from-blue-900 to-blue-600 rounded-xl p-8 text-white">
        <div className="text-center max-w-2xl mx-auto">
          <Shield className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl font-bold mb-3">Protect Your Family's Future</h3>
          <p className="opacity-90 mb-2">
            Now that probate is handled, make sure your own estate is protected. Avoid putting your family through probate.
          </p>
          <p className="text-lg mb-6">
            Living Trust Package starting at <span className="font-bold text-2xl">$400</span>
          </p>
          <a
            href="https://livingtrustcalifornia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Create Your Living Trust
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Document
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-700">{documentToDelete?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteDocument}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalVault;
