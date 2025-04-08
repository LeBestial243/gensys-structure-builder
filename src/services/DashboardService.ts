import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";
import { getClient } from "@/utils/supabaseClient";
import type { 
  DashboardStats, 
  Structure, 
  Jeune, 
  Evenement,
  Alerte,
  Transcription,
  Note
} from "@/types/dashboard";

/**
 * Service pour récupérer les données du dashboard
 */
export class DashboardService {
  /**
   * Récupère les informations d'une structure
   * @param structureId ID de la structure
   * @returns Informations de la structure
   */
  static async getStructureInfo(structureId: string): Promise<Structure | null> {
    try {
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .eq('id', structureId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la structure:', error);
        
        // Vérifier si l'erreur est due à l'absence de structure
        if (error.code === 'PGRST116') {
          console.log('Aucune structure trouvée avec cet ID, création d\'une structure par défaut');
          // Ici, vous pourriez appeler StructureService.createDefaultStructureIfNoneExist()
          return null;
        }
        
        throw new Error(`Erreur lors de la récupération de la structure: ${error.message}`);
      }

      return data as Structure;
    } catch (error) {
      console.error('Erreur service dashboard:', error);
      return null;
    }
  }

  /**
   * Récupère les statistiques pour le dashboard
   * @returns Statistiques du dashboard
   */
  static async getStats(userRole?: string): Promise<DashboardStats> {
    try {
      // Utilisez le client approprié en fonction du rôle
      const client = getClient(userRole);
      
      // Récupérer le nombre de jeunes (sans filtrer par structure)
      const { count: nombreJeunes = 0, error: jeunesError } = await client
        .from('jeunes')
        .select('id', { count: 'exact', head: true });

      if (jeunesError) {
        console.error('Erreur lors du comptage des jeunes:', jeunesError);
        throw new Error(`Erreur lors du comptage des jeunes: ${jeunesError.message}`);
      }

      // Récupérer le nombre de notes de cette année
      const debutAnnee = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const { count: nombreNotes = 0, error: notesError } = await client
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .gte('date_creation', debutAnnee);

      if (notesError) {
        console.error('Erreur lors du comptage des notes:', notesError);
        throw new Error(`Erreur lors du comptage des notes: ${notesError.message}`);
      }

      // Calculer le nombre d'alertes
      const alertes = await this.getAlertes();
      const nombreAlertes = alertes.length;

      return {
        nombreJeunes: nombreJeunes || 0,
        nombreNotes: nombreNotes || 0,
        nombreAlertes: nombreAlertes || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
    }
  }

  /**
   * Récupère les événements à venir 
   * @param jours Nombre de jours à prendre en compte (défaut: 7)
   * @returns Liste des événements
   */
  static async getEvenements(jours = 7, userRole?: string): Promise<Evenement[]> {
    try {
      // Utilisez le client approprié en fonction du rôle
      const client = getClient(userRole);
      
      const dateActuelle = new Date().toISOString();
      const dateFin = new Date();
      dateFin.setDate(dateFin.getDate() + jours);
      const dateFuture = dateFin.toISOString();

      const { data, error } = await client
        .from('evenements')
        .select('*, jeunes(prenom, nom)')
        .gte('date', dateActuelle)
        .lte('date', dateFuture)
        .order('date', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        throw new Error(`Erreur lors de la récupération des événements: ${error.message}`);
      }

      return data as Evenement[];
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
    }
  }

  /**
   * Récupère les alertes 
   * @returns Liste des alertes
   */
  static async getAlertes(userRole?: string): Promise<Alerte[]> {
    const alertes: Alerte[] = [];
    
    try {
      // Utilisez le client approprié en fonction du rôle
      const client = getClient(userRole);
      
      // 1. Récupérer les transcriptions non validées
      const { data: transcriptions, error: transcriptionsError } = await client
        .from('transcriptions')
        .select('*, jeunes(prenom, nom)')
        .eq('validee', false);

      if (transcriptionsError) {
        console.error('Erreur lors de la récupération des transcriptions:', transcriptionsError);
        throw new Error(`Erreur lors de la récupération des transcriptions: ${transcriptionsError.message}`);
      } else if (transcriptions) {
        // Transformer les transcriptions en alertes
        transcriptions.forEach((t: { 
          id: string; 
          date_entretien: string; 
          jeune_id: string; 
          structure_id: string;
          jeunes: { prenom: string; nom: string }
        }) => {
          alertes.push({
            id: `transcription-${t.id}`,
            titre: `Transcription à valider`,
            description: `Entretien avec ${t.jeunes.prenom} ${t.jeunes.nom} du ${new Date(t.date_entretien).toLocaleDateString()}`,
            type: 'transcription',
            date: t.date_entretien,
            lien: `/mes-jeunes/${t.jeune_id}/transcriptions/${t.id}`,
            jeune_id: t.jeune_id,
            structure_id: null
          });
        });
      }

      // 2. Récupérer les dossiers incomplets
      const { data: jeunes, error: jeunesError } = await client
        .from('jeunes')
        .select('*')
        .eq('dossier_complet', false);

      if (jeunesError) {
        console.error('Erreur lors de la récupération des jeunes:', jeunesError);
        throw new Error(`Erreur lors de la récupération des jeunes: ${jeunesError.message}`);
      } else if (jeunes) {
        // Transformer les jeunes avec dossiers incomplets en alertes
        jeunes.forEach((j: Jeune) => {
          alertes.push({
            id: `dossier-${j.id}`,
            titre: `Dossier incomplet`,
            description: `Le dossier de ${j.prenom} ${j.nom} est incomplet`,
            type: 'dossier',
            date: new Date().toISOString(),
            lien: `/mes-jeunes/${j.id}`,
            jeune_id: j.id,
            structure_id: null
          });
        });
      }

      // 3. Récupérer les notes à générer avant échéance
      const { data: evenements, error: evenementsError } = await client
        .from('evenements')
        .select('*, jeunes(prenom, nom)')
        .eq('type', 'echeance')
        .lte('date', new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());

      if (evenementsError) {
        console.error('Erreur lors de la récupération des événements:', evenementsError);
        throw new Error(`Erreur lors de la récupération des événements: ${evenementsError.message}`);
      } else if (evenements) {
        // Vérifier pour chaque échéance s'il existe une note
        for (const evt of evenements) {
          const { count, error: noteError } = await client
            .from('notes')
            .select('id', { count: 'exact', head: true })
            .eq('jeune_id', evt.jeune_id)
            .gte('date_creation', new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());

          if (noteError) {
            console.error('Erreur lors de la vérification des notes:', noteError);
            throw new Error(`Erreur lors de la vérification des notes: ${noteError.message}`);
          } else if (count === 0) {
            // S'il n'y a pas de note récente, créer une alerte
            alertes.push({
              id: `note-${evt.id}`,
              titre: `Note à générer`,
              description: `Échéance le ${new Date(evt.date).toLocaleDateString()} pour ${evt.jeunes.prenom} ${evt.jeunes.nom}`,
              type: 'note',
              date: evt.date,
              lien: `/mes-jeunes/${evt.jeune_id}/notes/nouvelle`,
              jeune_id: evt.jeune_id,
              structure_id: null
            });
          }
        }
      }

      // Trier les alertes par date
      return alertes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error; // Propager l'erreur pour la gérer dans le composant
    }
  }
}