import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Scale,
  Upload,
  FileText,
  Plus,
  X
} from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import DocumentViewer from './DocumentViewer';

const Documents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  // Get case ID from URL params or state
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('caseId');

  useEffect(() => {
    const loadCase = async () => {
      if (!caseId) {
        // Try to find user's case
        const q = query(
          collection(db, 'cases'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const caseDoc = snapshot.docs[0];
          setProbateCase({ id: caseDoc.id, ...caseDoc.data() });
        }
        setLoading(false);
        return;
      }

      try {
        const caseDoc = await getDoc(doc(db, 'cases', caseId));
        if (caseDoc.exists()) {
          setProbateCase({ id: caseDoc.id, ...caseDoc.data() });
        }
      } catch (error) {
        console.error('Error loading case:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [caseId, user]);

  const handleUploadComplete = (uploadedDocs) => {
    setShowUploadModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!probateCase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="bg-blue-900 p-2 rounded-lg mr-3">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Documents</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Case Found</h2>
            <p className="text-gray-600 mb-6">
              You need to create a case first before uploading documents.
            </p>
            <button
              onClick={() => navigate('/intake')}
              className="inline-flex items-center px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              Start Intake Process
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="bg-blue-900 p-2 rounded-lg mr-3">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Documents</h1>
                  <p className="text-sm text-gray-500">{probateCase.estateName}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload Documents
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Document Management</p>
              <p className="text-sm text-blue-700">
                Upload and manage all documents related to your probate case.
                Accepted formats: PDF, images (JPG, PNG), and Word documents.
                Maximum file size: 10MB per file.
              </p>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DocumentList
            caseId={probateCase.id}
            onViewDocument={setViewingDocument}
          />
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowUploadModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Upload className="h-6 w-6 mr-2 text-blue-600" />
                  Upload Documents
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <DocumentUpload
                caseId={probateCase.id}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
};

export default Documents;
