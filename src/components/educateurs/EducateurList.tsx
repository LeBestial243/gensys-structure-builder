
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, CalendarClock, Shield, User2 } from "lucide-react";
import { Educateur, EducateurRole } from "@/types/educateurs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface EducateurListProps {
  educateurs: Educateur[];
  isLoading: boolean;
  error: Error | null;
}

const EducateurList = ({ educateurs, isLoading, error }: EducateurListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAuth();
  
  // Vérifier si l'utilisateur actuel peut modifier les rôles
  const canManageEducateurs = currentUser?.role === "admin" || currentUser?.role === "super_admin";

  const filteredEducateurs = educateurs.filter(
    (educateur) =>
      educateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      educateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      educateur.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <p className="font-medium">Erreur lors du chargement des éducateurs</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un éducateur..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredEducateurs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              {searchTerm ? "Aucun éducateur ne correspond à votre recherche" : "Aucun éducateur n'est disponible"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEducateurs.map((educateur) => (
            <Card key={educateur.id} className="hover:shadow-md transition-shadow border-t-2 border-t-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User2 className="h-5 w-5 text-purple-500" />
                  <span>
                    {educateur.prenom} {educateur.nom}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{educateur.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <CalendarClock className="h-4 w-4 text-gray-400" />
                    <span>Inscrit le {new Date(educateur.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={`
                      ${educateur.role === 'super_admin' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                        educateur.role === 'admin' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                        'bg-purple-100 text-purple-800 hover:bg-purple-200'}
                    `}>
                      <Shield className="h-3 w-3 mr-1" />
                      {educateur.role}
                    </Badge>
                    
                    {canManageEducateurs && educateur.id !== currentUser?.id && (
                      <Button variant="ghost" size="sm" className="text-xs">
                        Gérer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducateurList;
