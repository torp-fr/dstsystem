import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useTracking } from "@/hooks/useTracking";
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
import CostStructuresPage from "./pages/dashboard/CostStructuresPage";
import CostStructureFormPage from "./pages/dashboard/CostStructureFormPage";
import CalendarPage from "./pages/dashboard/CalendarPage";
import SessionFormPage from "./pages/dashboard/SessionFormPage";
import SessionDetailPage from "./pages/dashboard/SessionDetailPage";
import QuotesPage from "./pages/dashboard/QuotesPage";
import QuoteFormPage from "./pages/dashboard/QuoteFormPage";
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
import DashboardLayout from "./components/layout/DashboardLayout";
import PrivateRoute from "./components/auth/PrivateRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Routes component with tracking
const AppRoutes = () => {
  useTracking();

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
        <Route index element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<ClientFormPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="clients/:id/edit" element={<ClientFormPage />} />
        <Route path="operators" element={<OperatorsPage />} />
        <Route path="operators/initialize" element={<OperatorInitializationPage />} />
        <Route path="operators/new" element={<OperatorFormPage />} />
        <Route path="operators/:id/edit" element={<OperatorFormPage />} />
        <Route path="costs" element={<CostStructuresPage />} />
        <Route path="costs/initialize" element={<CostInitializationPage />} />
        <Route path="costs/new" element={<CostStructureFormPage />} />
        <Route path="costs/:id/edit" element={<CostStructureFormPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="sessions/new" element={<SessionFormPage />} />
        <Route path="sessions/:id/edit" element={<SessionFormPage />} />
        <Route path="sessions/:id" element={<SessionDetailPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="quotes/new" element={<QuoteFormPage />} />
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
        <Route path="settings" element={<div>Paramètres - À venir</div>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
