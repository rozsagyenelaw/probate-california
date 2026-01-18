import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  CreditCard,
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';

const FLAT_FEE = 3995;

const AdminPayments = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    console.log('AdminPayments: Loading users...');
    // Simple query without orderBy to avoid index requirement
    const usersQuery = query(collection(db, 'users'));

    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      console.log('AdminPayments: Users loaded:', snapshot.size);
      const usersData = snapshot.docs
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
      setClients(usersData);
      setLoading(false);
    }, (error) => {
      console.error('AdminPayments: Error loading users:', error);
      setLoading(false);
    });

    return () => unsubUsers();
  }, []);

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const isPaid = c.paymentStatus === 'paid' || c.paymentStatus === 'installments_active';
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && isPaid) ||
      (statusFilter === 'pending' && !isPaid);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const paidClients = clients.filter(c => c.paymentStatus === 'paid' || c.paymentStatus === 'installments_active');
  const pendingClients = clients.filter(c => c.paymentStatus !== 'paid' && c.paymentStatus !== 'installments_active');

  const stats = {
    totalRevenue: paidClients.length * FLAT_FEE,
    paidCount: paidClients.length,
    pendingCount: pendingClients.length,
    pendingRevenue: pendingClients.length * FLAT_FEE
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500">Track all client payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.paidCount} paid client{stats.paidCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paidCount}</p>
              <p className="text-xs text-blue-600 mt-1">
                {formatCurrency(FLAT_FEE)} each
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {formatCurrency(stats.pendingRevenue)} potential
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              <p className="text-xs text-purple-600 mt-1">
                {stats.paidCount > 0 ? Math.round((stats.paidCount / clients.length) * 100) : 0}% conversion
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Loading payments...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No payment records found</p>
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          client.paymentStatus === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          <span className={`font-medium ${
                            client.paymentStatus === 'paid' ? 'text-green-700' : 'text-yellow-700'
                          }`}>
                            {(client.firstName?.[0] || '').toUpperCase()}
                            {(client.lastName?.[0] || '').toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {client.firstName} {client.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{client.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(FLAT_FEE)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : client.paymentStatus === 'installments_active'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {client.paymentStatus === 'paid' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid
                          </>
                        ) : client.paymentStatus === 'installments_active' ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Installments ({3 - (client.installmentsRemaining || 0)}/3)
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.paymentStatus === 'paid' || client.paymentStatus === 'installments_active'
                        ? formatDate(client.paidAt)
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.stripeSessionId ? (
                        <span className="text-xs font-mono text-gray-400 truncate max-w-[100px] block" title={client.stripeSessionId}>
                          {client.stripeSessionId.substring(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};

export default AdminPayments;
