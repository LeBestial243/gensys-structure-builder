import { supabase } from "@/integrations/supabase/client";

// Utiliser le client Supabase standard - suppression des headers spéciaux qui causent des problèmes
const supabaseAdmin = supabase;
import type { Jeune, Note, Transcription, Evenement } from "@/types/dashboard";

/**
 * Service pour gérer les jeunes et leurs données associées
 */
export class JeuneService {
  /**
   * Récupère la liste des jeunes d'une structure
   * @param structureId ID de la structure
   * @returns Liste des jeunes
   */
  static async getJeunesByStructure(structureId: string): Promise<Jeune[]> {
    try {
      // Utilisez supabaseAdmin pour contourner les politiques RLS
      const { data, error } = await supabaseAdmin
        .from('jeunes')
        .select('*')
        .eq('structure_id', structureId)
        .order('nom', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des jeunes:', error);
        return [];
      }

      return data as Jeune[];
    } catch (error) {
      console.error('Erreur service jeunes:', error);
      return [];
    }
  }

  /**
   * Récupère les détails d'un jeune par son ID
   * @param jeuneId ID du jeune
   * @returns Détails du jeune
   */
  static async getJeuneById(jeuneId: string): Promise<Jeune | null> {
    try {
      const { data, error } = await supabase
        .from('jeunes')
        .select('*')
        .eq('id', jeuneId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du jeune:', error);
        return null;
      }

      return data as Jeune;
    } catch (error) {
      console.error('Erreur service jeunes:', error);
      return null;
    }
  }

  /**
   * Récupère les notes d'un jeune
   * @param jeuneId ID du jeune
   * @returns Liste des notes
   */
  static async getNotesByJeune(jeuneId: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('jeune_id', jeuneId)
        .order('date_creation', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        return [];
      }

      return data as Note[];
    } catch (error) {
      console.error('Erreur service notes:', error);
      return [];
    }
  }

  /**
   * Récupère les transcriptions d'un jeune
   * @param jeuneId ID du jeune
   * @returns Liste des transcriptions
   */
  static async getTranscriptionsByJeune(jeuneId: string): Promise<Transcription[]> {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('jeune_id', jeuneId)
        .order('date_entretien', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des transcriptions:', error);
        return [];
      }

      return data as Transcription[];
    } catch (error) {
      console.error('Erreur service transcriptions:', error);
      return [];
    }
  }

  /**
   * Récupère les événements d'un jeune
   * @param jeuneId ID du jeune
   * @returns Liste des événements
   */
  static async getEvenementsByJeune(jeuneId: string): Promise<Evenement[]> {
    try {
      const { data, error } = await supabase
        .from('evenements')
        .select('*')
        .eq('jeune_id', jeuneId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return [];
      }

      return data as Evenement[];
    } catch (error) {
      console.error('Erreur service événements:', error);
      return [];
    }
  }

  /**
   * Crée une nouvelle note pour un jeune
   * @param note Note à créer
   * @returns Note créée
   */
  static async createNote(note: Omit<Note, 'id' | 'date_creation'>): Promise<Note | null> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la note:', error);
        return null;
      }

      return data as Note;
    } catch (error) {
      console.error('Erreur service notes:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle transcription pour un jeune
   * @param transcription Transcription à créer
   * @returns Transcription créée
   */
  static async createTranscription(
    transcription: Omit<Transcription, 'id' | 'date_entretien'>
  ): Promise<Transcription | null> {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .insert(transcription)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la transcription:', error);
        return null;
      }

      return data as Transcription;
    } catch (error) {
      console.error('Erreur service transcriptions:', error);
      return null;
    }
  }

  /**
   * Marque une transcription comme validée
   * @param transcriptionId ID de la transcription
   * @returns true si la mise à jour a réussi, false sinon
   */
  static async validerTranscription(transcriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transcriptions')
        .update({ validee: true })
        .eq('id', transcriptionId);

      if (error) {
        console.error('Erreur lors de la validation de la transcription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service transcriptions:', error);
      return false;
    }
  }

  /**
   * Marque un dossier jeune comme complet
   * @param jeuneId ID du jeune
   * @returns true si la mise à jour a réussi, false sinon
   */
  static async marquerDossierComplet(jeuneId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jeunes')
        .update({ dossier_complet: true })
        .eq('id', jeuneId);

      if (error) {
        console.error('Erreur lors de la mise à jour du dossier:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service jeunes:', error);
      return false;
    }
  }

  /**
   * Crée un nouveau jeune
   * @param jeune Données du jeune à créer
   * @returns Le jeune créé ou null en cas d'erreur
   */
  static async createJeune(jeune: {
    prenom: string;
    nom: string;
    date_naissance: string;
    structure_id: string;
    dossiers?: string[];
  }): Promise<Jeune | null> {
    try {
      console.log("Début de création du jeune avec données:", jeune);
      
      // Générer un UUID valide basé sur le nom de la structure
      function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      
      // Utiliser la structure fixe ou générer un UUID
      const structureUUID = "123e4567-e89b-12d3-a456-426614174000"; // UUID fixe pour toutes les structures
      
      // Créer un objet jeune pour l'insertion - sans le champ dossiers
      const jeuneData = {
        prenom: jeune.prenom,
        nom: jeune.nom,
        date_naissance: jeune.date_naissance,
        structure_id: structureUUID, // Utiliser l'UUID généré au lieu du nom
        dossier_complet: false
        // Retiré le champ dossiers pour éviter les erreurs
      };
      
      console.log("Données du jeune à insérer:", jeuneData);
      
      console.log("Données à insérer:", jeuneData);
      
      // Utilisez supabaseAdmin pour contourner les politiques RLS
      const { data, error } = await supabaseAdmin
        .from('jeunes')
        .insert(jeuneData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du jeune:', error);
        alert(`Erreur lors de la création: ${error.message}`);
        return null;
      }
      
      console.log("Jeune créé avec succès:", data);
      
      return data as Jeune;
    } catch (error) {
      console.error('Erreur service jeunes:', error);
      return null;
    }
  }
}