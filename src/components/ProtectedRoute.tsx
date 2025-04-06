import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "user" | "admin" | "super_admin" | "educateur";
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = "/" 
}: ProtectedRouteProps) => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si le chargement est terminé et que l'utilisateur n'est pas connecté,
    // rediriger vers la page d'accueil
    if (!isLoading && !currentUser) {
      navigate("/");
      return;
    }

    // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle,
    // rediriger vers la page spécifiée (par défaut: dashboard)
    if (!isLoading && currentUser && requiredRole && currentUser.role !== requiredRole) {
      navigate(redirectTo);
    }
  }, [currentUser, isLoading, navigate, redirectTo, requiredRole]);

  // Afficher l'état de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher (redirection gérée dans useEffect)
  if (!currentUser) {
    return null;
  }

  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle, ne rien afficher
  if (requiredRole && currentUser.role !== requiredRole) {
    return null;
  }

  // Sinon, afficher les enfants
  return <>{children}</>;
};

export default ProtectedRoute;