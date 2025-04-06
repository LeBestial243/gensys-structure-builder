
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Tableau de bord
        </h1>
        <p className="text-gray-500 mt-2">
          Bienvenue, {currentUser?.name || "Utilisateur"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Structures</CardTitle>
            <CardDescription>Gérez les structures de l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Vous pouvez créer, modifier et supprimer des structures.
            </p>
            {currentUser?.role === "super_admin" && (
              <Link to="/creer-structure">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 flex items-center gap-2"
                >
                  <span>Créer une structure</span>
                  <ArrowRightCircle className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Gérez les utilisateurs de l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Consultez la liste des utilisateurs et modifiez leurs droits.
            </p>
            <Button variant="outline" className="w-full">
              Voir les utilisateurs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Éducateurs</CardTitle>
            <CardDescription>Consultez la liste des éducateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Visualisez les éducateurs associés à votre structure.
            </p>
            <Link to="/educateurs">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <span>Voir les éducateurs</span>
                <Users className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
