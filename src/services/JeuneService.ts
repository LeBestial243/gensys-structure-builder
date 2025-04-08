import { supabase } from "@/integrations/supabase/client";

// Utiliser le client Supabase standard - suppression des headers spéciaux qui causent des problèmes
const supabaseAdmin = supabase;
import type { Jeune, Note, Transcription, Evenement } from "@/types/dashboard";

/**
 * Service pour gérer les jeunes et leurs données associées
 */
export class JeuneService {
  /**
   * Récupère la liste des jeunes 
   * @returns Liste des jeunes
   */
  static async getAllJeunes(): Promise<Jeune[]> {
    try {
      // Utilisez supabaseAdmin pour contourner les politiques RLS
      const { data, error } = await supabaseAdmin
        .from('jeunes')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des jeunes:', error);
        throw new Error(`Erreur lors de la récupération des jeunes: ${error.message}`);
      }

      return data as Jeune[];
    } catch (error) {
      console.error('Erreur service jeunes:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
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
      throw error; // Propager l'erreur pour la gérer dans le composant
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
        throw new Error(`Erreur lors de la récupération des notes: ${error.message}`);
      }

      return data as Note[];
    } catch (error) {
      console.error('Erreur service notes:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
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
        throw new Error(`Erreur lors de la récupération des transcriptions: ${error.message}`);
      }

      return data as Transcription[];
    } catch (error) {
      console.error('Erreur service transcriptions:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
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
        throw new Error(`Erreur lors de la récupération des événements: ${error.message}`);
      }

      return data as Evenement[];
    } catch (error) {
      console.error('Erreur service événements:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
    }
  }

  /**
   * Crée une nouvelle note pour un jeune
   * @param note Note à créer
   * @returns Note créée
   */
  static async createNote(note: Omit<Note, 'id' | 'date_creation'>): Promise<Note> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la note:', error);
        throw new Error(`Erreur lors de la création de la note: ${error.message}`);
      }

      return data as Note;
    } catch (error) {
      console.error('Erreur service notes:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
    }
  }

  /**
   * Crée une nouvelle transcription pour un jeune
   * @param transcription Transcription à créer
   * @returns Transcription créée
   */
  static async createTranscription(
    transcription: Omit<Transcription, 'id' | 'date_entretien'>
  ): Promise<Transcription> {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .insert(transcription)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la transcription:', error);
        throw new Error(`Erreur lors de la création de la transcription: ${error.message}`);
      }

      return data as Transcription;
    } catch (error) {
      console.error('Erreur service transcriptions:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
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
        throw new Error(`Erreur lors de la validation de la transcription: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur service transcriptions:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
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
        throw new Error(`Erreur lors de la mise à jour du dossier: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur service jeunes:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
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
    structure_manuelle?: string;
    dossiers?: string[];
  }): Promise<Jeune | null> {
    try {
      console.log("Début de création du jeune avec données:", jeune);
      
      // Validation des champs obligatoires
      if (!jeune.prenom || !jeune.nom || !jeune.date_naissance) {
        throw new Error("Les champs nom, prénom et date de naissance sont obligatoires");
      }
      
      // Créer un objet jeune simplifié, sans structure_id
      const jeuneData = {
        prenom: jeune.prenom,
        nom: jeune.nom,
        date_naissance: jeune.date_naissance,
        structure_manuelle: jeune.structure_manuelle || null,
        dossier_complet: false,
        dossiers: jeune.dossiers || null
      };
      
      console.log("Données du jeune à insérer:", jeuneData);
      
      // Utiliser directement le client Supabase avec méthode simplifiée
      console.log("Tentative de création avec méthode simplifiée");
      
      // Deux options pour insérer :
      // 1. Insertion directe (plus simple)
      const { data, error } = await supabase
        .from('jeunes')
        .insert(jeuneData)
        .select()
        .single();
      
      // 2. Alternative: utiliser une fonction RPC si elle est définie
      // const { data, error } = await supabase.rpc('create_jeune_without_structure', {
      //   jeune_data: jeuneData
      // });
        
      if (error) {
        console.error("Erreur lors de la création:", error);
        throw new Error(`Erreur lors de la création: ${error.message}`);
      }
        
      console.log("Jeune créé avec succès:", data);
      
      return data as Jeune;
    } catch (error) {
      console.error('Erreur service jeunes:', error);
      throw error;
    }
  }
}