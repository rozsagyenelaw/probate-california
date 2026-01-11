import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Auth pages
import Login from './components/common/Login';
import Register from './components/common/Register';
import ForgotPassword from './components/common/ForgotPassword';

// Landing page
import { LandingPage } from './components/landing';

// Main pages
import Dashboard from './components/dashboard/Dashboard';
import Intake from './components/intake/Intake';
import PaymentPage from './components/PaymentPage';
import PaymentSuccess from './components/PaymentSuccess';
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
import RequestAccounting from './components/accounting/RequestAccounting';
import RequestCourtAppearance from './components/court/RequestCourtAppearance';

// Admin pages
import {
  AdminLayout,
  AdminOverview,
  AdminCases,
  AdminCaseDetails,
  AdminClients,
  AdminDocuments,
  AdminSignatureRequests,
  AdminPayments,
  AdminMessages,
  AdminHearings
} from './components/admin';
import ClientSignaturePage from './components/signature/ClientSignaturePage';

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

// Home Route - always shows landing page (with login/logout buttons based on auth)
const HomeRoute = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return <LandingPage />;
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
        <Route path="/payment-success" element={
          <ProtectedRoute>
            <PaymentSuccess />
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
        <Route path="/request-accounting" element={
          <ProtectedRoute>
            <RequestAccounting />
          </ProtectedRoute>
        } />
        <Route path="/request-court-appearance" element={
          <ProtectedRoute>
            <RequestCourtAppearance />
          </ProtectedRoute>
        } />

        {/* Admin routes with nested layout */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminOverview />} />
          <Route path="cases" element={<AdminCases />} />
          <Route path="cases/:caseId" element={<AdminCaseDetails />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="signatures" element={<AdminSignatureRequests />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="hearings" element={<AdminHearings />} />
        </Route>

        {/* Public signature page (no auth required) */}
        <Route path="/sign/:requestId" element={<ClientSignaturePage />} />

        {/* Home route - landing page or dashboard based on auth */}
        <Route path="/" element={<HomeRoute />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
