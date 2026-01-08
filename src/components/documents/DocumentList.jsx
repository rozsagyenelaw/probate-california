import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Image,
  File,
  FileSpreadsheet,
  Loader2,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { DOCUMENT_CATEGORIES } from './DocumentUpload';

const DocumentList = ({ caseId, onViewDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    const q = query(
      collection(db, 'documents'),
      where('caseId', '==', caseId),
      where('status', '==', 'active'),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setDocuments(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching documents:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [caseId]);

  const handleDelete = async (document) => {
    if (!window.confirm(`Are you sure you want to delete "${document.fileName}"?`)) {
      return;
    }

    setDeleting(document.id);

    try {
      // Soft delete in Firestore (mark as deleted)
      await updateDoc(doc(db, 'documents', document.id), {
        status: 'deleted',
        deletedAt: new Date()
      });

      // Optionally delete from Storage (uncomment if you want permanent deletion)
      // const storageRef = ref(storage, document.storagePath);
      // await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="h-5 w-5 text-green-500" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    }
    return <File className="h-5 w-5 text-blue-500" />;
  };

  const getCategoryLabel = (categoryId) => {
    const category = DOCUMENT_CATEGORIES.find((c) => c.id === categoryId);
    return category?.label || categoryId;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const category = doc.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 sm:hidden"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filter
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            showFilters ? 'block' : 'hidden sm:block'
          }`}
        >
          <option value="all">All Categories</option>
          {DOCUMENT_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Document Count */}
      <div className="text-sm text-gray-600">
        {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
        {searchTerm || categoryFilter !== 'all' ? ' (filtered)' : ''}
      </div>

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {documents.length === 0
              ? 'No documents uploaded yet'
              : 'No documents match your search'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                {getCategoryLabel(category)} ({docs.length})
              </h3>
              <div className="space-y-2">
                {docs.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    {getFileIcon(document.fileType)}
                    <div className="flex-1 ml-3 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {document.fileName}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(document.uploadedAt)}</span>
                        {document.notes && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="truncate">{document.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {document.fileType?.startsWith('image/') || document.fileType === 'application/pdf' ? (
                        <button
                          onClick={() => onViewDocument?.(document)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      ) : null}
                      <a
                        href={document.downloadURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                      <button
                        onClick={() => handleDelete(document)}
                        disabled={deleting === document.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === document.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
