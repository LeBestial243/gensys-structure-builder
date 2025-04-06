
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EducateurList from "@/components/educateurs/EducateurList";
import { Educateur } from "@/types/educateurs";
import { useToast } from "@/hooks/use-toast";

const Educateurs = () => {
  const { currentUser } = useAuth();
  const [educateurs, setEducateurs] = useState<Educateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEducateurs = async () => {
      try {
        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        let query = supabase
          .from("educateurs")
          .select("*");

        // If not a super_admin, filter by structure_id
        if (currentUser.role !== "super_admin" && currentUser.structure_id) {
          query = query.eq("structure_id", currentUser.structure_id);
        }

        const { data, error } = await query.order("nom");

        if (error) throw error;

        setEducateurs(data || []);
      } catch (err) {
        console.error("Error fetching educateurs:", err);
        setError(err instanceof Error ? err : new Error("Une erreur est survenue lors du chargement des éducateurs"));
        toast({
          title: "Erreur",
          description: "Impossible de charger les éducateurs. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEducateurs();
  }, [currentUser, toast]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Éducateurs
        </h1>
        <p className="text-gray-500 mt-2">
          Liste des éducateurs {currentUser?.role !== "super_admin" && "de votre structure"}
        </p>
      </div>

      <EducateurList
        educateurs={educateurs}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default Educateurs;
