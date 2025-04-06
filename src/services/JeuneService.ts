import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase
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
      // On stocke les dossiers dans la base de données
      const dossiersJson = jeune.dossiers ? JSON.stringify(jeune.dossiers) : null;
      
      const { data, error } = await supabase
        .from('jeunes')
        .insert({
          prenom: jeune.prenom,
          nom: jeune.nom,
          date_naissance: jeune.date_naissance,
          structure_id: jeune.structure_id,
          dossier_complet: false,
          dossiers: dossiersJson  // Stocker les dossiers en tant que JSON
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du jeune:', error);
        return null;
      }
      
      return data as Jeune;
    } catch (error) {
      console.error('Erreur service jeunes:', error);
      return null;
    }
  }
}