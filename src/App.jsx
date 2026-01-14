import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Eager load - needed immediately for homepage
import { LandingPage } from './components/landing';

// Eager load - small auth components used frequently
import Login from './components/common/Login';
import Register from './components/common/Register';
import ForgotPassword from './components/common/ForgotPassword';
import NotFound from './components/common/NotFound';

// Lazy load - Dashboard & Protected pages (only for logged-in users)
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const Intake = lazy(() => import('./components/intake/Intake'));
const PaymentPage = lazy(() => import('./components/PaymentPage'));
const PaymentSuccess = lazy(() => import('./components/PaymentSuccess'));
const Documents = lazy(() => import('./components/documents').then(m => ({ default: m.Documents })));
const PetitionGeneration = lazy(() => import('./components/petition').then(m => ({ default: m.PetitionGeneration })));
const Messages = lazy(() => import('./components/messaging').then(m => ({ default: m.Messages })));
const RequestAccounting = lazy(() => import('./components/accounting/RequestAccounting'));
const RequestCourtAppearance = lazy(() => import('./components/court/RequestCourtAppearance'));

// Lazy load - Phase components (direct imports for better splitting)
const PublicationSetup = lazy(() => import('./components/phases/PublicationSetup'));
const BondSetup = lazy(() => import('./components/phases/BondSetup'));
const HearingPrep = lazy(() => import('./components/phases/HearingPrep'));
const SupplementGeneration = lazy(() => import('./components/phases/SupplementGeneration'));
const LettersIssued = lazy(() => import('./components/phases/LettersIssued'));
const InventoryAppraisal = lazy(() => import('./components/phases/InventoryAppraisal'));
const CreditorManagement = lazy(() => import('./components/phases/CreditorManagement'));
const FinalPetition = lazy(() => import('./components/phases/FinalPetition'));
const CaseClosing = lazy(() => import('./components/phases/CaseClosing'));

// Lazy load - Asset Discovery
const AssetDiscovery = lazy(() => import('./components/AssetDiscovery/AssetDiscovery'));

// Lazy load - Admin components (direct imports for better splitting)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./components/admin/AdminOverview'));
const AdminCases = lazy(() => import('./components/admin/AdminCases'));
const AdminCaseDetails = lazy(() => import('./components/admin/AdminCaseDetails'));
const AdminClients = lazy(() => import('./components/admin/AdminClients'));
const AdminDocuments = lazy(() => import('./components/admin/AdminDocuments'));
const AdminSignatureRequests = lazy(() => import('./components/admin/AdminSignatureRequests'));
const AdminPayments = lazy(() => import('./components/admin/AdminPayments'));
const AdminMessages = lazy(() => import('./components/admin/AdminMessages'));
const AdminHearings = lazy(() => import('./components/admin/AdminHearings'));
const AdminAssetDiscoveryPage = lazy(() => import('./components/admin/AdminAssetDiscoveryPage'));

// Lazy load - Signature page
const ClientSignaturePage = lazy(() => import('./components/signature/ClientSignaturePage'));

// Lazy load - Legal pages (direct imports)
const TermsOfService = lazy(() => import('./components/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./components/legal/PrivacyPolicy'));

// Lazy load - SEO/Marketing pages (direct imports for better splitting)
const CaliforniaProbateAdministration = lazy(() => import('./components/pages/CaliforniaProbateAdministration'));
const ProbateCourtLocations = lazy(() => import('./components/pages/ProbateCourtLocations'));
const ProbateFAQ = lazy(() => import('./components/pages/ProbateFAQ'));
const CityProbatePage = lazy(() => import('./components/pages/CityProbatePage'));

// Lazy load - Learn/Blog pages (direct imports for better splitting)
const LearnHub = lazy(() => import('./components/learn/LearnHub'));
const ClearIGNNotes = lazy(() => import('./components/learn/articles/ClearIGNNotes'));
const CaliforniaProbateFees = lazy(() => import('./components/learn/articles/CaliforniaProbateFees'));
const WhatIsProbateReferee = lazy(() => import('./components/learn/articles/WhatIsProbateReferee'));
const LettersTestamentary = lazy(() => import('./components/learn/articles/LettersTestamentary'));
const ProbateBondRequirements = lazy(() => import('./components/learn/articles/ProbateBondRequirements'));
const HowToFileProbate = lazy(() => import('./components/learn/articles/HowToFileProbate'));
const SmallEstateAffidavit = lazy(() => import('./components/learn/articles/SmallEstateAffidavit'));
const ProbateTimeline = lazy(() => import('./components/learn/articles/ProbateTimeline'));

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
      <Suspense fallback={<LoadingSpinner />}>
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
          <Route path="/asset-discovery" element={
            <ProtectedRoute>
              <AssetDiscovery />
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
            <Route path="asset-discovery" element={<AdminAssetDiscoveryPage />} />
            <Route path="signatures" element={<AdminSignatureRequests />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="hearings" element={<AdminHearings />} />
          </Route>

          {/* Public signature page (no auth required) */}
          <Route path="/sign/:requestId" element={<ClientSignaturePage />} />

          {/* Legal pages (public) */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* SEO/Marketing pages (public) */}
          <Route path="/california-probate-administration" element={<CaliforniaProbateAdministration />} />
          <Route path="/probate-court-locations-california" element={<ProbateCourtLocations />} />
          <Route path="/probate-faq-california" element={<ProbateFAQ />} />
          <Route path="/locations/:citySlug" element={<CityProbatePage />} />

          {/* Learn/Blog pages (public) */}
          <Route path="/learn-california-probate" element={<LearnHub />} />
          <Route path="/learn-california-probate/clear-ign-notes-stanley-mosk" element={<ClearIGNNotes />} />
          <Route path="/learn-california-probate/california-probate-fees-statutory-vs-flat" element={<CaliforniaProbateFees />} />
          <Route path="/learn-california-probate/what-is-probate-referee-california" element={<WhatIsProbateReferee />} />
          <Route path="/learn-california-probate/letters-testamentary-california-guide" element={<LettersTestamentary />} />
          <Route path="/learn-california-probate/probate-bond-requirements-california" element={<ProbateBondRequirements />} />
          <Route path="/learn-california-probate/how-to-file-probate-california" element={<HowToFileProbate />} />
          <Route path="/learn-california-probate/small-estate-affidavit-california" element={<SmallEstateAffidavit />} />
          <Route path="/learn-california-probate/probate-timeline-california-what-to-expect" element={<ProbateTimeline />} />

          {/* Home route - landing page or dashboard based on auth */}
          <Route path="/" element={<HomeRoute />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
