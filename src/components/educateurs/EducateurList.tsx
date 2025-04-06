
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Educateur } from "@/types/educateurs";

interface EducateurListProps {
  educateurs: Educateur[];
  isLoading: boolean;
  error: Error | null;
}

const EducateurList = ({ educateurs, isLoading, error }: EducateurListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEducateurs = educateurs.filter(
    (educateur) =>
      educateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      educateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      educateur.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lavender-500"></div>
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
            <Card key={educateur.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">
                  {educateur.prenom} {educateur.nom}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{educateur.email}</p>
                <Badge className="bg-lavender-100 text-lavender-800 hover:bg-lavender-200">
                  {educateur.role}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducateurList;
