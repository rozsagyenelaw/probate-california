import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import {
  FileText,
  Search,
  Download,
  Eye,
  RefreshCw,
  File,
  Image,
  FileSpreadsheet,
  Filter,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const CATEGORY_LABELS = {
  'death-certificate': 'Death Certificate',
  'will': 'Will',
  'codicil': 'Codicil',
  'property-deed': 'Property Deed',
  'vehicle-title': 'Vehicle Title',
  'bank-statement': 'Bank Statement',
  'investment-statement': 'Investment Statement',
  'insurance-policy': 'Insurance Policy',
  'debt-statement': 'Debt Statement',
  'id-document': 'ID Document',
  'court-document': 'Court Document',
  'other': 'Other'
};

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Simple query without compound conditions to avoid index requirement
    const docsQuery = query(collection(db, 'documents'));

    const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
      const docsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Filter and sort in JavaScript instead of Firestore
        .filter(doc => doc.status === 'active' || !doc.status)
        .sort((a, b) => {
          const timeA = a.uploadedAt?.toMillis?.() || 0;
          const timeB = b.uploadedAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
      setDocuments(docsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading documents:', error);
      setLoading(false);
    });

    const casesQuery = query(collection(db, 'cases'));
    const unsubCases = onSnapshot(casesQuery, (snapshot) => {
      const casesMap = {};
      snapshot.docs.forEach(doc => {
        casesMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setCases(casesMap);
    });

    return () => {
      unsubDocs();
      unsubCases();
    };
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cases[doc.caseId]?.estateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cases[doc.caseId]?.petitioner?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cases[doc.caseId]?.petitioner?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || doc.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return Image;
    if (fileType?.includes('pdf')) return FileText;
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return FileSpreadsheet;
    return File;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'death-certificate': 'bg-red-100 text-red-700',
      'will': 'bg-purple-100 text-purple-700',
      'codicil': 'bg-purple-100 text-purple-700',
      'property-deed': 'bg-green-100 text-green-700',
      'vehicle-title': 'bg-blue-100 text-blue-700',
      'bank-statement': 'bg-yellow-100 text-yellow-700',
      'investment-statement': 'bg-yellow-100 text-yellow-700',
      'insurance-policy': 'bg-orange-100 text-orange-700',
      'debt-statement': 'bg-pink-100 text-pink-700',
      'id-document': 'bg-cyan-100 text-cyan-700',
      'court-document': 'bg-indigo-100 text-indigo-700',
      'other': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const stats = {
    total: documents.length,
    categories: Object.entries(
      documents.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 3)
  };

  const openDeleteModal = (document) => {
    setDocumentToDelete(document);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    setDeleting(true);
    try {
      // Delete from Firebase Storage if storagePath exists
      if (documentToDelete.storagePath) {
        const storageRef = ref(storage, documentToDelete.storagePath);
        try {
          await deleteObject(storageRef);
        } catch (storageError) {
          // File might not exist in storage, continue with Firestore deletion
          console.warn('Could not delete from storage:', storageError);
        }
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'documents', documentToDelete.id));

      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500">All uploaded documents across cases</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <FileText className="h-5 w-5 text-blue-900" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Documents</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        {stats.categories.map(([category, count]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{CATEGORY_LABELS[category] || category}</p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(category)}`}>
                {Math.round((count / stats.total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Documents</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search documents..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case / Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => {
                  const FileIcon = getFileIcon(doc.fileType);
                  const caseData = cases[doc.caseId];
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <FileIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 max-w-xs truncate" title={doc.fileName}>
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-gray-400">{doc.fileType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                          {CATEGORY_LABELS[doc.category] || doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {caseData ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {caseData.estateName || `Estate of ${caseData.decedent?.firstName || ''}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {caseData.petitioner?.firstName} {caseData.petitioner?.lastName}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {doc.downloadURL && (
                            <>
                              <a
                                href={doc.downloadURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="h-5 w-5" />
                              </a>
                              <a
                                href={doc.downloadURL}
                                download={doc.fileName}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="h-5 w-5" />
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => openDeleteModal(doc)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredDocuments.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
            Showing {filteredDocuments.length} of {documents.length} documents
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Document
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Are you sure you want to delete <span className="font-medium text-gray-700">{documentToDelete?.fileName}</span>? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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

export default AdminDocuments;
