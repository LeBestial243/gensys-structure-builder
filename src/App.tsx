<<<<<<< HEAD

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
            <Route path="/inscription" element={<Inscription />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
=======

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CreateStructure from "./pages/CreateStructure";
import Inscription from "./pages/Inscription";
import Educateurs from "./pages/Educateurs";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Suspense } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        }>
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
              <Route path="/inscription" element={<Inscription />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
>>>>>>> 4cdcce7c25244790c554bde60d8c924ea1ebf32e
