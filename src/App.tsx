import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useTracking } from "@/hooks/useTracking";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ensureDomainLoaded } from "@/services/domainLoader";

// Declare global window types for domain services
declare global {
  interface Window {
    PlanningRealtimeService?: {
      initialize: () => Promise<void>;
      cleanup: () => Promise<void>;
      _initialized?: boolean;
    };
  }
}
import Index from "./pages/Index";
import Solutions from "./pages/Solutions";
import Programs from "./pages/Programs";
import Audiences from "./pages/Audiences";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ClientsPage from "./pages/dashboard/ClientsPage";
import ClientFormPage from "./pages/dashboard/ClientFormPage";
import ClientDetailPage from "./pages/dashboard/ClientDetailPage";
import OperatorsPage from "./pages/dashboard/OperatorsPage";
import OperatorFormPage from "./pages/dashboard/OperatorFormPage";
import OperatorCostAnalysisPage from "./pages/dashboard/OperatorCostAnalysisPage";
import CostStructuresPage from "./pages/dashboard/CostStructuresPage";
import CostStructureFormPage from "./pages/dashboard/CostStructureFormPage";
import SessionsPage from "./pages/dashboard/SessionsPage";
import MarketplacePage from "./pages/dashboard/MarketplacePage";
import StaffingPage from "./pages/dashboard/StaffingPage";
import ClientPage from "./pages/dashboard/ClientPage";
import EnterpriseCockpitPage from "./pages/dashboard/EnterpriseCockpitPage";
import SessionFormPage from "./pages/dashboard/SessionFormPage";
import SessionDetailPage from "./pages/dashboard/SessionDetailPage";
import QuotesPage from "./pages/dashboard/QuotesPage";
import QuoteFormPage from "./pages/dashboard/QuoteFormPage";
import QuoteDetailPage from "./pages/dashboard/QuoteDetailPage";
import AmendmentsPage from "./pages/dashboard/AmendmentsPage";
import AmendmentFormPage from "./pages/dashboard/AmendmentFormPage";
import DepositsPage from "./pages/dashboard/DepositsPage";
import DepositFormPage from "./pages/dashboard/DepositFormPage";
import InvoicesPage from "./pages/dashboard/InvoicesPage";
import InvoiceDetailPage from "./pages/dashboard/InvoiceDetailPage";
import OffersPage from "./pages/dashboard/OffersPage";
import OfferFormPage from "./pages/dashboard/OfferFormPage";
import CostInitializationPage from "./pages/dashboard/CostInitializationPage";
import OperatorInitializationPage from "./pages/dashboard/OperatorInitializationPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import FinancesPage from "./pages/dashboard/FinancesPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import PrivateRoute from "./components/auth/PrivateRoute";
import AppErrorBoundary from "./components/common/AppErrorBoundary";
import RoleRouteGuard from "./components/auth/RoleRouteGuard";
import NotFound from "./pages/NotFound";
import { initializeMonitoring } from "@/lib/monitoring";
import { initializeRuntimeLock } from "@/lib/runtimeLock";

const queryClient = new QueryClient();

// Routes component with tracking and monitoring
const AppRoutes = () => {
  useTracking();

  // Initialize production runtime lock and global error monitoring on app startup
  useEffect(() => {
    initializeRuntimeLock(); // FINAL LOCK - must run first
    initializeMonitoring(); // Global error handlers

    // Initialize Supabase connection - needed before role checks
    // This ensures auth state is available to RoleRouteGuard
    if (supabase) {
      console.info('[APP] Supabase initialized for auth state tracking');
    }

    // Initialize Planning Realtime Service for dashboard data synchronization
    // With delayed retry if Supabase not ready on first attempt
    let retryTimer: any;

    const tryInitRealtime = async () => {
      const service = (window as any).PlanningRealtimeService;

      if (!service || service._initialized) {
        return;
      }

      try {
        console.info('[APP] Attempting to initialize PlanningRealtimeService...');
        await service.initialize();
        service._initialized = true;
        console.info('[APP] ✓ PlanningRealtimeService initialized successfully');
      } catch (error) {
        console.warn('[APP] PlanningRealtimeService init failed — will retry in 1.5s:', error);
        // Retry after delay if initialization fails
        retryTimer = setTimeout(tryInitRealtime, 1500);
      }
    };

    tryInitRealtime();

    // Cleanup: clear retry timer on unmount
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/programmes" element={<Programs />} />
      <Route path="/publics-cibles" element={<Audiences />} />
      <Route path="/a-propos" element={<About />} />
      <Route path="/tarifs" element={<Programs />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Default Dashboard Routes to Cockpit */}
        <Route index element={<Navigate to="/dashboard/cockpit" replace />} />

        {/* ENTERPRISE ROUTES - Role Guard */}
        <Route
          path="cockpit"
          element={
            <RoleRouteGuard allowedRoles={['enterprise']}>
              <EnterpriseCockpitPage />
            </RoleRouteGuard>
          }
        />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<ClientFormPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="clients/:id/edit" element={<ClientFormPage />} />
        <Route path="operators" element={<OperatorsPage />} />
        <Route path="operators/initialize" element={<OperatorInitializationPage />} />
        <Route path="operators/new" element={<OperatorFormPage />} />
        <Route path="operators/:id/edit" element={<OperatorFormPage />} />
        <Route path="operators/analysis" element={<OperatorCostAnalysisPage />} />
        <Route path="costs" element={<CostStructuresPage />} />
        <Route path="costs/initialize" element={<CostInitializationPage />} />
        <Route path="costs/new" element={<CostStructureFormPage />} />
        <Route path="costs/:id/edit" element={<CostStructureFormPage />} />
        {/* Unified Sessions - Replaces Planning + Calendar */}
        <Route path="sessions" element={<SessionsPage />} />

        {/* OPERATOR ROUTES - Role Guard */}
        <Route
          path="marketplace"
          element={
            <RoleRouteGuard allowedRoles={['operator']}>
              <MarketplacePage />
            </RoleRouteGuard>
          }
        />

        {/* ENTERPRISE STAFFING - Role Guard */}
        <Route
          path="staffing"
          element={
            <RoleRouteGuard allowedRoles={['enterprise']}>
              <StaffingPage />
            </RoleRouteGuard>
          }
        />

        {/* CLIENT ROUTES - Role Guard */}
        <Route
          path="client"
          element={
            <RoleRouteGuard allowedRoles={['client']}>
              <ClientPage />
            </RoleRouteGuard>
          }
        />
        <Route path="sessions/new" element={<SessionFormPage />} />
        <Route path="sessions/:id/edit" element={<SessionFormPage />} />
        <Route path="sessions/:id" element={<SessionDetailPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="quotes/new" element={<QuoteFormPage />} />
        <Route path="quotes/:id" element={<QuoteDetailPage />} />
        <Route path="quotes/:id/edit" element={<QuoteFormPage />} />
        <Route path="amendments" element={<AmendmentsPage />} />
        <Route path="amendments/new" element={<AmendmentFormPage />} />
        <Route path="amendments/:id/edit" element={<AmendmentFormPage />} />
        <Route path="deposits" element={<DepositsPage />} />
        <Route path="deposits/new" element={<DepositFormPage />} />
        <Route path="deposits/:id/edit" element={<DepositFormPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="offers/new" element={<OfferFormPage />} />
        <Route path="offers/:id/edit" element={<OfferFormPage />} />
        <Route path="finances" element={<FinancesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Ensure Domain layer is loaded on app startup
  ensureDomainLoaded();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppErrorBoundary>
              <AppRoutes />
            </AppErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
