import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "user" | "admin" | "super_admin";
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole = "user", 
  redirectTo = "/dashboard" 
}: ProtectedRouteProps) => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!currentUser || (requiredRole === "super_admin" && currentUser.role !== "super_admin"))) {
      navigate(redirectTo);
    }
  }, [currentUser, isLoading, navigate, redirectTo, requiredRole]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If we need super_admin and user isn't one, we'll redirect (handled in useEffect)
  if (requiredRole === "super_admin" && currentUser?.role !== "super_admin") {
    return null;
  }

  // Otherwise, render children
  return <>{children}</>;
};

export default ProtectedRoute;
