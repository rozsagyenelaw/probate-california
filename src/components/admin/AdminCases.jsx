import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, where, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  Search,
  Eye,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Filter,
  Download,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

const PHASE_LABELS = {
  1: 'Intake',
  2: 'Petition',
  3: 'Publication',
  4: 'Bond',
  5: 'First Hearing',
  6: 'Supplements',
  7: 'Letters',
  8: 'Inventory',
  9: 'Creditors',
  10: 'Distribution',
  11: 'Closing'
};

const AdminCases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    closed: 0,
    pendingReview: 0
  });
  const [unreadMessages, setUnreadMessages] = useState({});
  const [deleteModal, setDeleteModal] = useState({ show: false, caseItem: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    console.log('AdminCases: Starting to load cases...');

    // Simple query without orderBy to avoid index requirement
    const casesQuery = query(collection(db, 'cases'));

    const unsubCases = onSnapshot(casesQuery, (snapshot) => {
      console.log('AdminCases: Query returned', snapshot.size, 'documents');

      const casesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Sort by createdAt in JavaScript instead
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

      console.log('AdminCases: Processed cases:', casesData.length);
      if (casesData.length > 0) {
        console.log('AdminCases: First case:', casesData[0]);
      }

      setCases(casesData);

      const active = casesData.filter(c => c.status === 'active').length;
      const closed = casesData.filter(c => c.status === 'closed').length;
      const pendingReview = casesData.filter(c => c.currentPhase === 1).length;

      setStats({
        total: casesData.length,
        active,
        closed,
        pendingReview
      });

      setLoading(false);
    }, (error) => {
      console.error('AdminCases: Error loading cases:', error);
      console.error('AdminCases: Error code:', error.code);
      setLoading(false);
    });

    // Simple messages query - filter in JavaScript to avoid index requirement
    const messagesQuery = query(collection(db, 'messages'));

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      const unread = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Filter: not from admin and not read
        if (data.isAdmin === false && data.read === false) {
          unread[data.caseId] = (unread[data.caseId] || 0) + 1;
        }
      });
      setUnreadMessages(unread);
    }, (error) => {
      console.error('AdminCases: Error loading messages:', error);
    });

    return () => {
      unsubCases();
      unsubMessages();
    };
  }, []);

  const handleDeleteCase = async () => {
    if (!deleteModal.caseItem) return;

    setDeleting(true);
    const caseId = deleteModal.caseItem.id;

    try {
      // Delete all documents for this case
      const docsQuery = query(collection(db, 'documents'), where('caseId', '==', caseId));
      const docsSnapshot = await getDocs(docsQuery);
      for (const docSnap of docsSnapshot.docs) {
        await deleteDoc(doc(db, 'documents', docSnap.id));
      }
      console.log(`Deleted ${docsSnapshot.size} documents for case ${caseId}`);

      // Delete all messages for this case
      const messagesQuery = query(collection(db, 'messages'), where('caseId', '==', caseId));
      const messagesSnapshot = await getDocs(messagesQuery);
      for (const msgSnap of messagesSnapshot.docs) {
        await deleteDoc(doc(db, 'messages', msgSnap.id));
      }
      console.log(`Deleted ${messagesSnapshot.size} messages for case ${caseId}`);

      // Delete the case document
      await deleteDoc(doc(db, 'cases', caseId));
      console.log(`Deleted case ${caseId}`);

      setDeleteModal({ show: false, caseItem: null });
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Failed to delete case. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.estateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.petitioner?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.petitioner?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.petitioner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter;

    const matchesPhase =
      phaseFilter === 'all' || c.currentPhase === parseInt(phaseFilter);

    return matchesSearch && matchesStatus && matchesPhase;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPhaseColor = (phase) => {
    if (phase <= 3) return 'bg-blue-100 text-blue-700';
    if (phase <= 6) return 'bg-yellow-100 text-yellow-700';
    if (phase <= 9) return 'bg-purple-100 text-purple-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-500">Manage all probate cases</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Users className="h-5 w-5 text-blue-900" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-2 mr-3">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Closed</p>
              <p className="text-xl font-bold text-gray-900">{stats.closed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-2 mr-3">
              <AlertCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">New (Intake)</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingReview}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Cases</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cases..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Phases</option>
                {Object.entries(PHASE_LABELS).map(([num, label]) => (
                  <option key={num} value={num}>{num}. {label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Loading cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No cases found</p>
            {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estate / Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    County
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">
                          {caseItem.estateName || `Estate of ${caseItem.decedent?.firstName || ''} ${caseItem.decedent?.lastName || ''}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {caseItem.petitioner?.firstName} {caseItem.petitioner?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{caseItem.petitioner?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {caseItem.caseNumber || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {caseItem.filingCounty || caseItem.decedent?.lastAddress?.county || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPhaseColor(caseItem.currentPhase || 1)}`}>
                        {caseItem.currentPhase || 1}. {PHASE_LABELS[caseItem.currentPhase || 1]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        caseItem.status === 'closed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {caseItem.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(caseItem.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/cases/${caseItem.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/messages?caseId=${caseItem.id}`)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative"
                          title="Messages"
                        >
                          <MessageSquare className="h-5 w-5" />
                          {unreadMessages[caseItem.id] && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                              {unreadMessages[caseItem.id]}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, caseItem })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Case"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredCases.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
            Showing {filteredCases.length} of {cases.length} cases
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-900">Delete Case</h3>
              </div>
              <button
                onClick={() => setDeleteModal({ show: false, caseItem: null })}
                className="text-gray-400 hover:text-gray-600"
                disabled={deleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {deleteModal.caseItem?.estateName || 'this case'}
                </span>
                ?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-medium mb-1">This action will permanently delete:</p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>The case record</li>
                  <li>All uploaded documents</li>
                  <li>All messages for this case</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, caseItem: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCase}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Case
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCases;
