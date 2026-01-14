import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Lock,
  Search,
  RefreshCw,
  FolderOpen,
  FileText,
  Eye,
  Download,
  User,
  ChevronDown,
  ChevronRight,
  Image,
  File
} from 'lucide-react';

const CATEGORY_LABELS = {
  'probate-orders': 'Probate Orders',
  'letters': 'Letters & Certificates',
  'inventory': 'Inventory & Appraisal',
  'financial': 'Financial Documents',
  'property': 'Property Documents',
  'estate-planning': 'Estate Planning',
  'correspondence': 'Correspondence',
  'other': 'Other Documents'
};

const AdminVaults = () => {
  const [vaults, setVaults] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVaults, setExpandedVaults] = useState({});

  useEffect(() => {
    loadVaults();
  }, []);

  const loadVaults = async () => {
    setLoading(true);
    try {
      // Load all vaults
      const vaultsSnapshot = await getDocs(collection(db, 'vaults'));
      const vaultsData = vaultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load user info for each vault
      const usersMap = {};
      for (const vault of vaultsData) {
        try {
          const userDoc = await getDoc(doc(db, 'users', vault.userId || vault.id));
          if (userDoc.exists()) {
            usersMap[vault.id] = { id: userDoc.id, ...userDoc.data() };
          }
        } catch (err) {
          console.warn('Could not load user for vault:', vault.id);
        }
      }

      setUsers(usersMap);
      setVaults(vaultsData);
    } catch (error) {
      console.error('Error loading vaults:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVault = (vaultId) => {
    setExpandedVaults(prev => ({
      ...prev,
      [vaultId]: !prev[vaultId]
    }));
  };

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

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return FileText;
    if (type?.includes('image')) return Image;
    return File;
  };

  const filteredVaults = vaults.filter(vault => {
    const user = users[vault.id];
    const searchLower = searchTerm.toLowerCase();
    return (
      user?.email?.toLowerCase().includes(searchLower) ||
      user?.firstName?.toLowerCase().includes(searchLower) ||
      user?.lastName?.toLowerCase().includes(searchLower) ||
      vault.documents?.some(doc => doc.name?.toLowerCase().includes(searchLower))
    );
  });

  const totalDocuments = vaults.reduce((acc, vault) => acc + (vault.documents?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Digital Vaults</h1>
        <p className="text-gray-500">View all client document vaults</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Lock className="h-5 w-5 text-blue-900" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Vaults</p>
              <p className="text-xl font-bold text-gray-900">{vaults.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Documents</p>
              <p className="text-xl font-bold text-gray-900">{totalDocuments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-2 mr-3">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clients with Vaults</p>
              <p className="text-xl font-bold text-gray-900">{vaults.filter(v => (v.documents?.length || 0) > 0).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Client Vaults</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by client or document..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Loading vaults...</p>
          </div>
        ) : filteredVaults.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No vaults found</p>
            <p className="text-sm mt-1">Clients have not uploaded any vault documents yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredVaults.map((vault) => {
              const user = users[vault.id];
              const isExpanded = expandedVaults[vault.id];
              const docCount = vault.documents?.length || 0;

              return (
                <div key={vault.id} className="hover:bg-gray-50">
                  {/* Vault Header */}
                  <button
                    onClick={() => toggleVault(vault.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400 mr-3" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <Lock className="h-5 w-5 text-blue-900" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email || vault.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {docCount} document{docCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm text-gray-500">
                        Updated: {formatDate(vault.updatedAt)}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Documents */}
                  {isExpanded && docCount > 0 && (
                    <div className="px-6 pb-4 pl-20">
                      <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                        {vault.documents.map((document) => {
                          const FileIcon = getFileIcon(document.type);
                          return (
                            <div key={document.id} className="flex items-center justify-between p-3">
                              <div className="flex items-center min-w-0 flex-1">
                                <div className="p-2 bg-white rounded-lg mr-3">
                                  <FileIcon className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{document.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {CATEGORY_LABELS[document.category] || document.category} •{' '}
                                    {formatFileSize(document.size)} •{' '}
                                    {formatDate(document.uploadedAt)}
                                  </p>
                                </div>
                              </div>
                              {document.downloadURL && (
                                <div className="flex items-center gap-2 ml-4">
                                  <a
                                    href={document.downloadURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View"
                                  >
                                    <Eye className="h-5 w-5" />
                                  </a>
                                  <a
                                    href={document.downloadURL}
                                    download={document.name}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Download"
                                  >
                                    <Download className="h-5 w-5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isExpanded && docCount === 0 && (
                    <div className="px-6 pb-4 pl-20">
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <FolderOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No documents in this vault</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVaults;
