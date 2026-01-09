import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import {
  Scale,
  LogOut,
  FileText,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Menu,
  X,
  Settings,
  User
} from 'lucide-react';

// Dashboard Components
import CaseHeader from './CaseHeader';
import PhaseTracker from './PhaseTracker';
import ActionRequired from './ActionRequired';
import KeyDates from './KeyDates';
import QuickLinks from './QuickLinks';

const Dashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [probateCase, setProbateCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Load user's probate case
  useEffect(() => {
    const loadCase = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.warn('Loading timeout - setting loading to false');
        setLoading(false);
      }, 10000); // 10 second timeout

      try {
        const casesQuery = query(
          collection(db, 'cases'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(casesQuery);

        if (!snapshot.empty) {
          const caseDoc = snapshot.docs[0];
          setProbateCase({ id: caseDoc.id, ...caseDoc.data() });
        }

        // Load unread messages count
        try {
          const messagesQuery = query(
            collection(db, 'messages'),
            where('userId', '==', user.uid),
            where('read', '==', false)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          setUnreadMessages(messagesSnapshot.size);
        } catch (msgError) {
          console.warn('Error loading messages:', msgError);
        }
      } catch (error) {
        console.error('Error loading case:', error);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    loadCase();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // No case view - shown when user has no probate case yet
  const NoCaseView = () => (
    <div className="text-center py-12">
      <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <FileText className="h-10 w-10 text-blue-900" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome to California Probate
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Complete your probate case for a flat fee of $3,995. Our step-by-step process
        guides you through all 11 phases of California probate.
      </p>
      <div className="bg-blue-50 rounded-lg p-6 max-w-lg mx-auto mb-8">
        <h3 className="font-semibold text-blue-900 mb-4">What's Included:</h3>
        <ul className="text-left space-y-3">
          {[
            'Complete case management dashboard',
            'All required court forms prepared',
            'Step-by-step guidance through 11 phases',
            'Publication coordination',
            'Document upload & storage',
            'Attorney review at key milestones'
          ].map((item, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => navigate('/intake')}
        className="inline-flex items-center px-8 py-4 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-lg font-medium"
      >
        Start Your Probate Case
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>
      <p className="mt-4 text-sm text-gray-500">
        Takes about 30 minutes to complete initial intake
      </p>
    </div>
  );

  // Case dashboard view - shown when user has an active case
  const CaseDashboardView = () => (
    <div className="space-y-6">
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
    </div>
  );

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
        {probateCase ? <CaseDashboardView /> : <NoCaseView />}

        {/* Contact Section - Always visible */}
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
