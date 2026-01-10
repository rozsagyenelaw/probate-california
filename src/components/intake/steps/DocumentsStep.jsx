import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../services/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Loader2,
  CloudUpload,
  Eye
} from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const DocumentsStep = ({ formData, updateFormData }) => {
  const { user } = useAuth();
  const { documents, willExists } = formData;
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRefs = useRef({});

  const requiredDocuments = [
    {
      id: 'deathCertificate',
      name: 'Certified Death Certificate',
      description: 'Original certified copy from the county or state vital records office',
      required: true
    },
    ...(willExists ? [{
      id: 'originalWill',
      name: 'Original Will',
      description: 'The original signed will document (not a copy)',
      required: true
    }] : []),
    ...(willExists && formData.codicilExists ? [{
      id: 'codicils',
      name: 'Codicils',
      description: 'All amendments to the will',
      required: true
    }] : []),
    {
      id: 'propertyDeeds',
      name: 'Property Deeds',
      description: 'Deed(s) for any real property owned by the decedent',
      required: false
    },
    {
      id: 'vehicleTitles',
      name: 'Vehicle Titles',
      description: 'Pink slips for any vehicles owned',
      required: false
    },
    {
      id: 'bankStatements',
      name: 'Bank/Investment Statements',
      description: 'Recent statements showing account balances',
      required: false
    },
    {
      id: 'lifeInsurance',
      name: 'Life Insurance Policies',
      description: 'Policy documents showing beneficiaries',
      required: false
    }
  ];

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'File type not allowed. Please upload PDF, images, or Word documents.' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 10MB limit.' };
    }
    return { valid: true };
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = async (docId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploadError(null);
    setUploadingDoc(docId);
    setUploadProgress(0);

    try {
      // Create a temporary storage path for intake documents
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `intake/${user.uid}/${docId}/${fileName}`;
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
          setUploadError('Failed to upload file. Please try again.');
          setUploadingDoc(null);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update form data with uploaded file info
            updateFormData({
              documents: {
                ...documents,
                [docId]: {
                  ...documents?.[docId],
                  hasDocument: true,
                  uploaded: true,
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type,
                  storagePath,
                  downloadURL,
                  uploadedAt: new Date().toISOString()
                }
              }
            });

            setUploadingDoc(null);
            setUploadProgress(0);
          } catch (error) {
            console.error('Error getting download URL:', error);
            setUploadError('Failed to complete upload. Please try again.');
            setUploadingDoc(null);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload file. Please try again.');
      setUploadingDoc(null);
    }

    // Clear the input
    event.target.value = '';
  };

  const handleRemoveFile = (docId) => {
    updateFormData({
      documents: {
        ...documents,
        [docId]: {
          hasDocument: false,
          uploaded: false
        }
      }
    });
  };

  const handleHasDocument = (docId, hasDocument) => {
    // Only update if not already uploaded
    if (!documents?.[docId]?.uploaded) {
      updateFormData({
        documents: {
          ...documents,
          [docId]: {
            ...documents?.[docId],
            hasDocument
          }
        }
      });
    }
  };

  const handleDocumentNote = (docId, note) => {
    updateFormData({
      documents: {
        ...documents,
        [docId]: {
          ...documents?.[docId],
          note
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Document Upload</p>
            <p className="text-sm text-blue-700">
              Upload your documents now or indicate which ones you'll need to obtain.
              You can also upload additional documents later through your dashboard.
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-700">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-4">
        {requiredDocuments.map((doc) => {
          const docData = documents?.[doc.id];
          const isUploading = uploadingDoc === doc.id;
          const isUploaded = docData?.uploaded;

          return (
            <div
              key={doc.id}
              className={`border rounded-lg p-4 ${
                isUploaded ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    {doc.required && (
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                        Required
                      </span>
                    )}
                    {isUploaded && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Uploaded
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                </div>
              </div>

              {/* Upload Area or Uploaded File */}
              {isUploaded ? (
                <div className="mt-4 flex items-center justify-between bg-white rounded-lg p-3 border">
                  <div className="flex items-center min-w-0">
                    <FileText className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {docData.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(docData.fileSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    {docData.downloadURL && (
                      <a
                        href={docData.downloadURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleRemoveFile(doc.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : isUploading ? (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
                    <span className="text-sm text-blue-700">Uploading...</span>
                    <span className="ml-auto text-sm text-blue-600">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <input
                    ref={(el) => (fileInputRefs.current[doc.id] = el)}
                    type="file"
                    onChange={(e) => handleFileSelect(doc.id, e)}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                  />
                  <button
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <CloudUpload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload {doc.name.toLowerCase()}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        PDF, images, or Word documents (max 10MB)
                      </span>
                    </div>
                  </button>

                  {/* Alternative: Don't have it yet */}
                  <div className="mt-3 flex items-center">
                    <label className="flex items-center cursor-pointer text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={docData?.hasDocument === false}
                        onChange={(e) => handleHasDocument(doc.id, !e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded mr-2"
                      />
                      I don't have this document yet
                    </label>
                  </div>

                  {docData?.hasDocument === false && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={docData?.note || ''}
                        onChange={(e) => handleDocumentNote(doc.id, e.target.value)}
                        placeholder="How will you obtain this? (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Documents Section */}
      <div className="border-t pt-6">
        <h3 className="font-medium text-gray-900 mb-4">Other Helpful Documents</h3>
        <p className="text-sm text-gray-600 mb-4">
          These documents are optional but may be helpful. You can upload them later through your dashboard.
        </p>
        <ul className="text-sm text-gray-600 space-y-2 ml-4">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Trust documents (if any assets were held in trust)
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Business ownership documents
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Retirement account statements (401k, IRA, pension)
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Outstanding bills or debt statements
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Marriage certificate (if applicable)
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-2"></span>
            Divorce decree (if applicable)
          </li>
        </ul>
      </div>

      {/* Info note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Original documents (especially the will and death certificate)
              may need to be mailed or delivered to our office. We'll provide instructions after
              your case is created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsStep;
