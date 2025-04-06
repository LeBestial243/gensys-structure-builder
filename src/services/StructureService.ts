import { supabase } from "@/integrations/supabase/client";

export interface StructureInviteResponse {
  invite_link: string;
  structure: {
    id: string;
    name: string;
  };
}

/**
 * Service pour gérer les structures
 */
export class StructureService {
  /**
   * Récupère toutes les structures
   * @returns Liste des structures
   */
  static async getAllStructures() {
    try {
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des structures:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Erreur service structures:', error);
      return [];
    }
  }

  /**
   * Crée une structure par défaut si aucune n'existe
   * @returns La structure créée ou null en cas d'erreur
   */
  static async createDefaultStructureIfNoneExist() {
    try {
      // Vérifier si des structures existent déjà
      const { count, error: countError } = await supabase
        .from('structures')
        .select('id', { count: 'exact', head: true });

      if (countError) {
        console.error('Erreur lors du comptage des structures:', countError);
        return null;
      }

      // Si des structures existent déjà, ne rien faire
      if (count && count > 0) {
        return null;
      }

      // Créer une structure par défaut
      const { data, error } = await supabase
        .from('structures')
        .insert({
          name: 'Structure par défaut',
          type: 'MECS',
          city: 'Paris',
          email: 'contact@structure-par-defaut.fr',
          max_users: 50
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la structure par défaut:', error);
        return null;
      }

      console.log('Structure par défaut créée avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la structure par défaut:', error);
      return null;
    }
  }
  /**
   * Génère un lien d'invitation pour une structure
   * @param structureId ID de la structure
   * @returns Objet contenant le lien d'invitation et les informations de structure
   * @throws Error en cas d'échec de la requête
   */
  static async generateInviteLink(structureId: string): Promise<StructureInviteResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invite-link', {
        body: { structure_id: structureId },
      });

      if (error) {
        throw new Error(`Erreur lors de la génération du lien: ${error.message}`);
      }

      return data as StructureInviteResponse;
    } catch (error) {
      console.error('Erreur service structure:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une structure existe
   * @param structureId ID de la structure à vérifier
   * @returns true si la structure existe, false sinon
   */
  static async checkStructureExists(structureId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('structures')
        .select('id')
        .eq('id', structureId)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erreur lors de la vérification de la structure:', error);
      return false;
    }
  }

  /**
   * Récupère le nombre d'éducateurs dans une structure
   * @param structureId ID de la structure
   * @returns Nombre d'éducateurs
   */
  static async getEducateursCount(structureId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('educateurs')
        .select('id', { count: 'exact', head: true })
        .eq('structure_id', structureId);

      if (error) {
        console.error('Erreur lors du comptage des éducateurs:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Erreur lors du comptage des éducateurs:', error);
      return 0;
    }
  }

  /**
   * Vérifie si une structure a dépassé son quota d'utilisateurs
   * @param structureId ID de la structure
   * @returns true si le quota est dépassé, false sinon
   */
  static async isUserQuotaExceeded(structureId: string): Promise<boolean> {
    try {
      // Récupérer la structure
      const { data: structure, error: structureError } = await supabase
        .from('structures')
        .select('max_users')
        .eq('id', structureId)
        .single();

      if (structureError || !structure) {
        console.error('Erreur lors de la récupération de la structure:', structureError);
        return true; // Par sécurité, considérer que le quota est dépassé
      }

      // Récupérer le nombre d'éducateurs
      const educateursCount = await this.getEducateursCount(structureId);

      // Vérifier si le quota est dépassé
      return educateursCount >= structure.max_users;
    } catch (error) {
      console.error('Erreur lors de la vérification du quota:', error);
      return true; // Par sécurité, considérer que le quota est dépassé
    }
  }
}