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
import OperatorsPage from "./pages/dashboard/OperatorsPage";
import OperatorFormPage from "./pages/dashboard/OperatorFormPage";
import CostStructuresPage from "./pages/dashboard/CostStructuresPage";
import CostStructureFormPage from "./pages/dashboard/CostStructureFormPage";
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
        <Route path="clients/:id/edit" element={<ClientFormPage />} />
        <Route path="operators" element={<OperatorsPage />} />
        <Route path="operators/new" element={<OperatorFormPage />} />
        <Route path="operators/:id/edit" element={<OperatorFormPage />} />
        <Route path="costs" element={<CostStructuresPage />} />
        <Route path="costs/new" element={<CostStructureFormPage />} />
        <Route path="costs/:id/edit" element={<CostStructureFormPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="offers" element={<div>Gestion Offres - À venir</div>} />
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
