import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, doc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Users,
  Search,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

const AdminClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, client: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    console.log('AdminClients: Loading data...');

    // Simple query, sort in JS
    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      console.log('AdminClients: Users loaded:', snapshot.size);
      const usersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setClients(usersData);
      setLoading(false);
    }, (error) => {
      console.error('AdminClients: Error loading users:', error);
      setLoading(false);
    });

    const unsubCases = onSnapshot(query(collection(db, 'cases')), (snapshot) => {
      console.log('AdminClients: Cases loaded:', snapshot.size);
      const casesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCases(casesData);
    }, (error) => console.error('AdminClients: Error loading cases:', error));

    return () => {
      unsubUsers();
      unsubCases();
    };
  }, []);

  const getCaseForUser = (userId) => {
    return cases.find(c => c.userId === userId);
  };

  const handleDeleteClient = async () => {
    if (!deleteModal.client) return;

    setDeleting(true);
    const clientId = deleteModal.client.id;

    try {
      // Delete all documents for this client
      const docsQuery = query(collection(db, 'documents'), where('userId', '==', clientId));
      const docsSnapshot = await getDocs(docsQuery);
      for (const docSnap of docsSnapshot.docs) {
        await deleteDoc(doc(db, 'documents', docSnap.id));
      }
      console.log(`Deleted ${docsSnapshot.size} documents for client ${clientId}`);

      // Delete all cases for this client
      const casesQuery = query(collection(db, 'cases'), where('userId', '==', clientId));
      const casesSnapshot = await getDocs(casesQuery);
      for (const caseSnap of casesSnapshot.docs) {
        await deleteDoc(doc(db, 'cases', caseSnap.id));
      }
      console.log(`Deleted ${casesSnapshot.size} cases for client ${clientId}`);

      // Delete the user document
      await deleteDoc(doc(db, 'users', clientId));
      console.log(`Deleted user ${clientId}`);

      setDeleteModal({ show: false, client: null });
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredClients = clients.filter(c => {
    // If no search term, match all
    const matchesSearch = !searchTerm.trim() ||
      (c.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (c.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm);

    const matchesPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && c.paymentStatus === 'paid') ||
      (paymentFilter === 'pending' && c.paymentStatus !== 'paid');

    return matchesSearch && matchesPayment;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const stats = {
    total: clients.length,
    paid: clients.filter(c => c.paymentStatus === 'paid').length,
    pending: clients.filter(c => c.paymentStatus !== 'paid').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-500">Manage all registered clients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Users className="h-5 w-5 text-blue-900" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-2 mr-3">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Payment</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Clients</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search clients..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Clients</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending Payment</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No clients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estate / Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const clientCase = getCaseForUser(client.id);
                  // Get client name from user record OR from case petitioner data
                  const clientFirstName = client.firstName || clientCase?.petitioner?.firstName || '';
                  const clientLastName = client.lastName || clientCase?.petitioner?.lastName || '';
                  const clientFullName = `${clientFirstName} ${clientLastName}`.trim() || 'Unknown';
                  const clientInitials = `${clientFirstName?.[0] || ''}${clientLastName?.[0] || ''}`.toUpperCase() || '?';

                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-900 font-medium">
                              {clientInitials}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">
                              {clientFullName}
                            </p>
                            <p className="text-sm text-gray-500">{client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {clientCase ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {clientCase.estateName || 'Unnamed Estate'}
                            </p>
                            {clientCase.caseNumber && (
                              <p className="text-sm text-gray-500">
                                Case #{clientCase.caseNumber}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              Phase {clientCase.currentPhase || 1} of 11
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No case started</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {client.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                                {client.phone}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <a href={`mailto:${client.email}`} className="hover:text-blue-600 truncate max-w-[150px]">
                              {client.email}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {client.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                        {client.paymentDate && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(client.paymentDate)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(client.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {clientCase && (
                            <button
                              onClick={() => navigate(`/admin/cases/${clientCase.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Case"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteModal({ show: true, client })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Client"
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
        {!loading && filteredClients.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
            Showing {filteredClients.length} of {clients.length} clients
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
                <h3 className="text-lg font-semibold text-red-900">Delete Client</h3>
              </div>
              <button
                onClick={() => setDeleteModal({ show: false, client: null })}
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
                  {deleteModal.client?.firstName} {deleteModal.client?.lastName}
                </span>
                ?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-medium mb-1">This action will permanently delete:</p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>The client's user account</li>
                  <li>All cases associated with this client</li>
                  <li>All uploaded documents</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, client: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
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
                    Delete Client
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

export default AdminClients;
