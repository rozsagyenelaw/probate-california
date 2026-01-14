import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import {
  Scale,
  LogOut,
  Phone,
  Mail,
  Menu,
  X,
  User,
  CheckCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';

// Dashboard Components
import CaseHeader from './CaseHeader';
import PhaseTracker from './PhaseTracker';
import ActionRequired from './ActionRequired';
import KeyDates from './KeyDates';
import QuickLinks from './QuickLinks';
import FinancialDocsUpload from './FinancialDocsUpload';

// Landing page for users without a case
import { LandingPage } from '../landing';

// Case dashboard view - shown when user has an active case
const CaseDashboardView = ({ probateCase, unreadMessages, navigate }) => {
  // Check if payment is incomplete
  // Payment is pending if:
  // 1. No payment object exists, OR
  // 2. Payment status is 'pending' or undefined, OR
  // 3. Case status is 'pending_payment'
  const paymentStatus = probateCase?.payment?.status;
  const caseStatus = probateCase?.status;
  const isPaid = paymentStatus === 'paid' || paymentStatus === 'completed' || caseStatus === 'active';
  const showPaymentReminder = !isPaid && (
    caseStatus === 'pending_payment' ||
    paymentStatus === 'pending' ||
    (!paymentStatus && probateCase?.currentPhase === 1)
  );

  return (
  <div className="space-y-6">
    {/* Payment Reminder - shown if payment is pending */}
    {showPaymentReminder && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start sm:items-center flex-col sm:flex-row gap-4">
        <div className="flex items-center flex-1">
          <div className="bg-amber-100 rounded-full p-2 mr-3">
            <CreditCard className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">Complete Your Payment</p>
            <p className="text-sm text-amber-700">
              Your case has been started. Complete payment to proceed with document preparation.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/payment')}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors whitespace-nowrap"
        >
          Complete Payment
        </button>
      </div>
    )}

    {/* Case Header */}
    <CaseHeader probateCase={probateCase} />

    {/* Phase Tracker */}
    <PhaseTracker
      currentPhase={probateCase?.currentPhase || 1}
      phases={probateCase?.phases || {}}
    />

    {/* Main Content Grid */}
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Action Required & Key Dates */}
      <div className="lg:col-span-2 space-y-6">
        {/* Action Required */}
        <ActionRequired
          currentPhase={probateCase?.currentPhase || 1}
          probateCase={probateCase}
        />

        {/* Key Dates */}
        <KeyDates probateCase={probateCase} />
      </div>

      {/* Right Column - Quick Links */}
      <div className="lg:col-span-1">
        <QuickLinks
          probateCase={probateCase}
          unreadMessages={unreadMessages}
        />
      </div>
    </div>

    {/* Financial Documents Upload for Asset Discovery */}
    <div className="mt-6">
      <FinancialDocsUpload caseId={probateCase?.id} />
    </div>
  </div>
  );
};

const Dashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);
  const initialLoadRef = useRef(true);

  // Check for success message from intake submission
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state so message doesn't show again on refresh
      window.history.replaceState({}, document.title);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Load user's probate case
  useEffect(() => {
    // Handle initial load without user
    if (!user) {
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        const timer = setTimeout(() => setLoading(false), 100);
        return () => clearTimeout(timer);
      }
      return;
    }

    const loadCase = async () => {
      console.log('Dashboard: loadCase called');
      console.log('Dashboard: user.uid =', user.uid);
      console.log('Dashboard: location.state =', location.state);

      try {
        // If we just came from intake with a caseId, load that specific case
        if (location.state?.caseId) {
          console.log('Dashboard: Loading specific case by ID:', location.state.caseId);
          const caseDoc = await getDoc(doc(db, 'cases', location.state.caseId));
          console.log('Dashboard: Case exists?', caseDoc.exists());
          if (caseDoc.exists()) {
            const caseData = { id: caseDoc.id, ...caseDoc.data() };
            console.log('Dashboard: Loaded case data:', caseData);
            setProbateCase(caseData);
            setLoading(false);
            return;
          }
        }

        // Otherwise query for user's most recent case
        console.log('Dashboard: Querying cases collection for userId:', user.uid);
        const casesQuery = query(
          collection(db, 'cases'),
          where('userId', '==', user.uid),
          limit(10)
        );

        const snapshot = await getDocs(casesQuery);
        console.log('Dashboard: Query returned', snapshot.size, 'documents');
        console.log('Dashboard: snapshot.empty =', snapshot.empty);

        if (!snapshot.empty) {
          // Log all found cases
          snapshot.docs.forEach((doc, index) => {
            console.log(`Dashboard: Case ${index}:`, doc.id, doc.data());
          });

          // Find the most recent case manually
          let mostRecentCase = null;
          let mostRecentTime = 0;

          snapshot.docs.forEach(caseDoc => {
            const data = caseDoc.data();
            const createdAt = data.createdAt?.toMillis?.() || 0;
            if (createdAt > mostRecentTime) {
              mostRecentTime = createdAt;
              mostRecentCase = { id: caseDoc.id, ...data };
            }
          });

          if (mostRecentCase) {
            console.log('Dashboard: Setting probateCase to:', mostRecentCase);
            setProbateCase(mostRecentCase);
          }
        } else {
          console.log('Dashboard: No cases found for this user');
        }
      } catch (err) {
        console.error('Dashboard: Error loading case:', err);
        console.error('Dashboard: Error code:', err.code);
        console.error('Dashboard: Error message:', err.message);
      } finally {
        setLoading(false);
      }
    };

    // Quick timeout - show dashboard fast even if DB is slow
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 second max wait

    loadCase().finally(() => clearTimeout(timeout));

    // Load messages in background - don't block
    const loadMessages = async () => {
      try {
        // Simple query without compound conditions
        const messagesQuery = query(
          collection(db, 'messages'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(messagesQuery);
        const unread = snapshot.docs.filter(d => d.data().read === false).length;
        setUnreadMessages(unread);
      } catch (err) {
        // Silently fail for messages
      }
    };
    loadMessages();

    return () => clearTimeout(timeout);
  }, [user, location.state?.caseId]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your case...</p>
        </div>
      </div>
    );
  }

  // Show professional landing page if user doesn't have a case yet
  if (!probateCase) {
    return <LandingPage />;
  }

  // Show case dashboard for users with an active case
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-2"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center">
                <div className="bg-blue-900 p-2 rounded-lg mr-3">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">California Probate</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">Law Offices of Rozsa Gyene</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.firstName} {userProfile?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => {}}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
            <p className="text-green-800 font-medium">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <CaseDashboardView probateCase={probateCase} unreadMessages={unreadMessages} navigate={navigate} />

        {/* Contact Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-blue-900 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Call Us</p>
                <a href="tel:+18182916217" className="font-medium text-blue-900 hover:text-blue-700">
                  (818) 291-6217
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-900 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email Us</p>
                <a href="mailto:rozsagyenelaw@yahoo.com" className="font-medium text-blue-900 hover:text-blue-700">
                  rozsagyenelaw@yahoo.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Law Offices of Rozsa Gyene. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
