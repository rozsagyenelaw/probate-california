import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Scale,
  LogOut,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Phone,
  Mail
} from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Placeholder for when no case exists yet
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-blue-900 p-2 rounded-lg mr-3">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">California Probate</h1>
                <p className="text-sm text-gray-500">Law Offices of Rozsa Gyene</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userProfile?.firstName} {userProfile?.lastName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NoCaseView />

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-blue-900 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Call Us</p>
                <p className="font-medium">(818) 291-6217</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-900 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email Us</p>
                <p className="font-medium">rozsagyenelaw@yahoo.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
