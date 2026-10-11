import PortalAdminRedirect from './components/common/PortalAdminRedirect';
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Eager load - needed immediately for homepage
import { LandingPage } from './components/landing';

import NotFound from './components/common/NotFound';
import PortalRedirect from './components/common/PortalRedirect';
import { useAuthHold } from './utils/authHold';

// Lazy load - sign-in pages pull in the Firebase SDK, which public pages do not need up front
const Login = lazy(() => import('./components/common/Login'));
const Register = lazy(() => import('./components/common/Register'));
const ForgotPassword = lazy(() => import('./components/common/ForgotPassword'));

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

// Lazy load - Digital Vault
const DigitalVault = lazy(() => import('./components/DigitalVault'));

// W3-beyond pages (items 70, 73): hidden until their switches are on
const LandingEs = lazy(() => import('./beyond/es/LandingEs'));
const ComparePage = lazy(() => import('./beyond/compare/ComparePage'));

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
const AdminVaults = lazy(() => import('./components/admin/AdminVaults'));

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
const IntestateSuccession = lazy(() => import('./components/learn/articles/IntestateSuccession'));
const ExecutorDuties = lazy(() => import('./components/learn/articles/ExecutorDuties'));

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
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Come back to this page (for example an add-on purchase) after signing in
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
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
  const location = useLocation();
  const authHold = useAuthHold();

  // Stay on the page (keep its state) while a sign-in still needs the client's answer
  if (loading && !authHold) {
    return <LoadingSpinner />;
  }

  if (user && !authHold) {
    const from = typeof location.state?.from === 'string' && location.state.from.startsWith('/') ? location.state.from : '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Home Route - always shows the landing page right away (its header buttons follow the sign-in state)
const HomeRoute = () => <LandingPage />;

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
          {/* Start Your Case happens inside the client home (W3-home item 53) */}
          <Route path="/register" element={<PortalRedirect />} />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />

          {/* Client pages: the one client home is portal.myprobateca.com (W3-home item 51) */}
          <Route path="/distribution" element={<PortalRedirect />} />
          <Route path="/dashboard" element={<PortalRedirect />} />
          {/* Open to guests: the first step creates or finds their account from their email */}
          <Route path="/payment" element={<PaymentPage />} />
          {/* Open to guests returning from checkout (they are not signed in yet) */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/intake" element={<PortalRedirect />} />
          <Route path="/intake/:step" element={<PortalRedirect />} />
          <Route path="/documents" element={<PortalRedirect />} />
          <Route path="/petition" element={<PortalRedirect />} />
          <Route path="/publication" element={<PortalRedirect />} />
          <Route path="/bond" element={<PortalRedirect />} />
          <Route path="/hearing" element={<PortalRedirect />} />
          <Route path="/supplements" element={<PortalRedirect />} />
          <Route path="/letters" element={<PortalRedirect />} />
          <Route path="/inventory" element={<PortalRedirect />} />
          <Route path="/creditors" element={<PortalRedirect />} />
          <Route path="/final-petition" element={<PortalRedirect />} />
          <Route path="/closing" element={<PortalRedirect />} />
          <Route path="/messages" element={<PortalRedirect />} />
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
          <Route path="/vault" element={<PortalRedirect />} />

          {/* Admin routes with nested layout */}
          <Route path="/admin" element={
            <PortalAdminRedirect fallback={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            } />
          }>
            <Route index element={<AdminOverview />} />
            <Route path="cases" element={<AdminCases />} />
            <Route path="cases/:caseId" element={<AdminCaseDetails />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="asset-discovery" element={<AdminAssetDiscoveryPage />} />
            <Route path="vaults" element={<AdminVaults />} />
            <Route path="signatures" element={<AdminSignatureRequests />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="hearings" element={<AdminHearings />} />
          </Route>

          {/* Public signature page (no auth required) */}
          <Route path="/sign/:requestId" element={<PortalRedirect />} />

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
          <Route path="/learn-california-probate/dying-without-will-california-intestate-succession" element={<IntestateSuccession />} />
          <Route path="/learn-california-probate/executor-duties-california-probate" element={<ExecutorDuties />} />

          {/* Home route - landing page or dashboard based on auth */}
          <Route path="/es" element={<LandingEs />} />
          <Route path="/compare/:slug" element={<ComparePage />} />
          <Route path="/" element={<HomeRoute />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
