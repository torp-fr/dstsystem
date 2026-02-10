import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Solutions from "./pages/Solutions";
import Programs from "./pages/Programs";
import Audiences from "./pages/Audiences";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import PrivateRoute from "./components/auth/PrivateRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
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
              <Route path="clients" element={<div>Gestion Clients - À venir</div>} />
              <Route path="offers" element={<div>Gestion Offres - À venir</div>} />
              <Route path="finances" element={<div>Gestion Finances - À venir</div>} />
              <Route path="settings" element={<div>Paramètres - À venir</div>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
