import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Auth pages
import Login from './components/common/Login';
import Register from './components/common/Register';
import ForgotPassword from './components/common/ForgotPassword';

// Main pages
import Dashboard from './components/dashboard/Dashboard';
import Intake from './components/intake/Intake';
import PaymentPage from './components/common/PaymentPage';
import { Documents } from './components/documents';
import { PetitionGeneration } from './components/petition';
import {
  PublicationSetup,
  BondSetup,
  HearingPrep,
  SupplementGeneration,
  LettersIssued,
  InventoryAppraisal,
  CreditorManagement,
  FinalPetition,
  CaseClosing
} from './components/phases';
import { Messages } from './components/messaging';

// Admin pages
import AdminDashboard from './components/dashboard/AdminDashboard';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path="/intake" element={
          <ProtectedRoute>
            <Intake />
          </ProtectedRoute>
        } />
        <Route path="/intake/:step" element={
          <ProtectedRoute>
            <Intake />
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        } />
        <Route path="/petition" element={
          <ProtectedRoute>
            <PetitionGeneration />
          </ProtectedRoute>
        } />
        <Route path="/publication" element={
          <ProtectedRoute>
            <PublicationSetup />
          </ProtectedRoute>
        } />
        <Route path="/bond" element={
          <ProtectedRoute>
            <BondSetup />
          </ProtectedRoute>
        } />
        <Route path="/hearing" element={
          <ProtectedRoute>
            <HearingPrep />
          </ProtectedRoute>
        } />
        <Route path="/supplements" element={
          <ProtectedRoute>
            <SupplementGeneration />
          </ProtectedRoute>
        } />
        <Route path="/letters" element={
          <ProtectedRoute>
            <LettersIssued />
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute>
            <InventoryAppraisal />
          </ProtectedRoute>
        } />
        <Route path="/creditors" element={
          <ProtectedRoute>
            <CreditorManagement />
          </ProtectedRoute>
        } />
        <Route path="/final-petition" element={
          <ProtectedRoute>
            <FinalPetition />
          </ProtectedRoute>
        } />
        <Route path="/closing" element={
          <ProtectedRoute>
            <CaseClosing />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
