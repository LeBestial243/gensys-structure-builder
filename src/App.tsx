
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CreateStructure from "./pages/CreateStructure";
import Inscription from "./pages/Inscription";
import Educateurs from "./pages/Educateurs";
import MesJeunes from "./pages/MesJeunes";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/creer-structure" element={
              <ProtectedRoute requiredRole="super_admin" redirectTo="/dashboard">
                <CreateStructure />
              </ProtectedRoute>
            } />
            <Route path="/educateurs" element={
              <ProtectedRoute>
                <Educateurs />
              </ProtectedRoute>
            } />
            <Route path="/mes-jeunes" element={
              <ProtectedRoute>
                <MesJeunes />
              </ProtectedRoute>
            } />
            <Route path="/jeunes" element={
              <Navigate to="/mes-jeunes" replace />
            } />
            <Route path="/jeunes/:id" element={
              <Navigate to="/mes-jeunes/:id" replace />
            } />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
