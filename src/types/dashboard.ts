// Types pour le dashboard des éducateurs

// Structure
export interface Structure {
  id: string;
  name: string;
  type: 'MECS' | 'SISEIP' | 'ITEP' | 'Autre';
  city: string;
  logo_url: string | null;
  max_users: number;
  email: string;
  created_at: string;
}

// Jeune suivi par un éducateur
export interface Jeune {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string;
  structure_id?: string | null;
  dossier_complet: boolean;
  created_at: string;
}

// Note éducative
export interface Note {
  id: string;
  titre: string;
  contenu: string;
  date_creation: string;
  jeune_id: string;
  educateur_id: string;
  structure_id?: string | null;
}

// Transcription d'entretien
export interface Transcription {
  id: string;
  contenu: string;
  date_entretien: string;
  validee: boolean;
  jeune_id: string;
  educateur_id: string;
  structure_id?: string | null;
}

// Événement du calendrier
export interface Evenement {
  id: string;
  titre: string;
  description: string;
  date: string;
  type: 'rdv' | 'anniversaire' | 'echeance' | 'autre';
  jeune_id: string;
  structure_id?: string | null;
}

// Alerte
export interface Alerte {
  id: string;
  titre: string;
  description: string;
  type: 'transcription' | 'note' | 'dossier';
  date: string;
  lien: string;
  jeune_id: string;
  structure_id?: string | null;
}

// Statistiques
export interface DashboardStats {
  nombreJeunes: number;
  nombreNotes: number;
  nombreAlertes: number;
}