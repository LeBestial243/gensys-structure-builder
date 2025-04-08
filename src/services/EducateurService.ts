import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";
import { getClient } from "@/utils/supabaseClient";
import { Educateur, EducateurRole, EducateurMode } from "@/types/educateurs";

/**
 * Service pour gérer les éducateurs
 */
export class EducateurService {
  /**
   * Récupère tous les éducateurs
   * @returns Liste des éducateurs
   * @throws Error en cas d'échec de la requête
   */
  static async getEducateurs(userRole?: string): Promise<Educateur[]> {
    try {
      // Utilisez le client approprié en fonction du rôle
      const client = getClient(userRole);
      
      const { data, error } = await client
        .from('educateurs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur lors de la récupération des éducateurs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erreur service éducateurs:', error);
      throw error;
    }
  }

  /**
   * Récupère un éducateur par son ID
   * @param educateurId ID de l'éducateur
   * @returns Éducateur ou null si non trouvé
   */
  static async getEducateurById(educateurId: string): Promise<Educateur | null> {
    try {
      const { data, error } = await supabase
        .from('educateurs')
        .select('*')
        .eq('id', educateurId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'éducateur:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'éducateur:', error);
      return null;
    }
  }

  /**
   * Met à jour le rôle d'un éducateur
   * @param educateurId ID de l'éducateur
   * @param role Nouveau rôle
   * @returns true si la mise à jour a réussi, false sinon
   */
  static async updateEducateurRole(educateurId: string, role: EducateurRole): Promise<boolean> {
    try {
      // Mettre à jour l'éducateur dans la table 'educateurs'
      const { error: educateurError } = await supabase
        .from('educateurs')
        .update({ role })
        .eq('id', educateurId);

      if (educateurError) {
        console.error('Erreur lors de la mise à jour du rôle de l\'éducateur:', educateurError);
        return false;
      }

      // Mettre à jour les métadonnées utilisateur dans auth.users via admin
      const { error: userError } = await supabase.auth.admin.updateUserById(
        educateurId,
        { user_metadata: { role } }
      );

      if (userError) {
        console.error('Erreur lors de la mise à jour des métadonnées utilisateur:', userError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      return false;
    }
  }

  /**
   * Met à jour le mode d'un éducateur
   * @param educateurId ID de l'éducateur
   * @param mode Nouveau mode
   * @returns true si la mise à jour a réussi, false sinon
   */
  static async updateEducateurMode(educateurId: string, mode: EducateurMode): Promise<boolean> {
    try {
      // Mettre à jour l'éducateur dans la table 'educateurs'
      const { error: educateurError } = await supabase
        .from('educateurs')
        .update({ mode })
        .eq('id', educateurId);

      if (educateurError) {
        console.error('Erreur lors de la mise à jour du mode de l\'éducateur:', educateurError);
        return false;
      }

      // Mettre à jour les métadonnées utilisateur dans auth.users via admin
      const { error: userError } = await supabase.auth.admin.updateUserById(
        educateurId,
        { user_metadata: { mode } }
      );

      if (userError) {
        console.error('Erreur lors de la mise à jour des métadonnées utilisateur:', userError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mode:', error);
      return false;
    }
  }

  /**
   * Supprime un éducateur
   * @param educateurId ID de l'éducateur
   * @returns true si la suppression a réussi, false sinon
   */
  static async deleteEducateur(educateurId: string): Promise<boolean> {
    try {
      // La suppression dans la table educateurs est gérée par le trigger Supabase
      const { error } = await supabase.auth.admin.deleteUser(educateurId);

      if (error) {
        console.error('Erreur lors de la suppression de l\'éducateur:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'éducateur:', error);
      return false;
    }
  }
}