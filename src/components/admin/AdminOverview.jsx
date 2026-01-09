import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Briefcase,
  Users,
  FileText,
  CreditCard,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  MessageSquare
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

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    totalClients: 0,
    totalDocuments: 0,
    paidClients: 0,
    pendingPayments: 0,
    unreadMessages: 0
  });
  const [recentCases, setRecentCases] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to cases
    const casesQuery = query(collection(db, 'cases'), orderBy('createdAt', 'desc'));
    const unsubCases = onSnapshot(casesQuery, (snapshot) => {
      const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentCases(cases.slice(0, 5));
      setStats(prev => ({
        ...prev,
        totalCases: cases.length,
        activeCases: cases.filter(c => c.status === 'active').length
      }));
    });

    // Subscribe to users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({
        ...prev,
        totalClients: users.length,
        paidClients: users.filter(u => u.paymentStatus === 'paid').length,
        pendingPayments: users.filter(u => u.paymentStatus !== 'paid').length
      }));
    });

    // Subscribe to documents
    const docsQuery = query(
      collection(db, 'documents'),
      where('status', '==', 'active'),
      orderBy('uploadedAt', 'desc')
    );
    const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({ ...prev, totalDocuments: docs.length }));

      // Build recent activity from documents
      const docActivity = docs.slice(0, 5).map(d => ({
        type: 'document',
        message: `New document uploaded: ${d.fileName}`,
        time: d.uploadedAt?.toDate?.() || new Date(),
        category: d.category
      }));
      setRecentActivity(docActivity);
    });

    // Subscribe to unread messages
    const messagesQuery = query(
      collection(db, 'messages'),
      where('isAdmin', '==', false),
      where('read', '==', false)
    );
    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      setStats(prev => ({ ...prev, unreadMessages: snapshot.size }));
    });

    setLoading(false);

    return () => {
      unsubCases();
      unsubUsers();
      unsubDocs();
      unsubMessages();
    };
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of all probate cases and clients</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Briefcase}
          label="Total Cases"
          value={stats.totalCases}
          subValue={`${stats.activeCases} active`}
          color="border-blue-600"
          onClick={() => navigate('/admin/cases')}
        />
        <StatCard
          icon={Users}
          label="Total Clients"
          value={stats.totalClients}
          color="border-green-600"
          onClick={() => navigate('/admin/clients')}
        />
        <StatCard
          icon={FileText}
          label="Documents"
          value={stats.totalDocuments}
          color="border-purple-600"
          onClick={() => navigate('/admin/documents')}
        />
        <StatCard
          icon={CreditCard}
          label="Payments"
          value={stats.paidClients}
          subValue={`${stats.pendingPayments} pending`}
          color="border-yellow-600"
          onClick={() => navigate('/admin/payments')}
        />
      </div>

      {/* Unread Messages Alert */}
      {stats.unreadMessages > 0 && (
        <div
          onClick={() => navigate('/admin/messages')}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-red-600 mr-3" />
            <span className="text-red-800 font-medium">
              You have {stats.unreadMessages} unread message{stats.unreadMessages !== 1 ? 's' : ''} from clients
            </span>
          </div>
          <ArrowRight className="h-5 w-5 text-red-600" />
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
            <button
              onClick={() => navigate('/admin/cases')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentCases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No cases yet</div>
            ) : (
              recentCases.map((caseItem) => (
                <div key={caseItem.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {caseItem.estateName || `Estate of ${caseItem.decedent?.firstName} ${caseItem.decedent?.lastName}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {caseItem.petitioner?.firstName} {caseItem.petitioner?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        caseItem.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {caseItem.status || 'Active'}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        Phase {caseItem.currentPhase || 1}: {PHASE_LABELS[caseItem.currentPhase || 1]}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No recent activity</div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="p-4 flex items-start">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(activity.time)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/cases')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <Briefcase className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">View Cases</span>
          </button>
          <button
            onClick={() => navigate('/admin/clients')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">View Clients</span>
          </button>
          <button
            onClick={() => navigate('/admin/documents')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">View Documents</span>
          </button>
          <button
            onClick={() => navigate('/admin/messages')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center relative"
          >
            <MessageSquare className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Messages</span>
            {stats.unreadMessages > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {stats.unreadMessages}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
