
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { currentUser, login, isLoading } = useAuth();

  const handleDemoLogin = async () => {
    await login("admin@gensys.app", "password123");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-purple-50">
      <div className="text-center max-w-xl px-4">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
          GenSys Structure Builder
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Plateforme de gestion des structures d'accueil et des utilisateurs
        </p>
        
        {currentUser ? (
          <div className="space-y-4">
            <p className="text-green-600">
              Connecté en tant que {currentUser.email}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                  Accéder au tableau de bord
                </Button>
              </Link>
              
              {currentUser.role === "super_admin" && (
                <Link to="/creer-structure">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Créer une structure
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleDemoLogin}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Connexion démo"}
          </Button>
        )}
      </div>
      
      <div className="mt-16 text-sm text-gray-500">
        © 2025 GenSys - Tous droits réservés
      </div>
    </div>
  );
};

export default Index;
