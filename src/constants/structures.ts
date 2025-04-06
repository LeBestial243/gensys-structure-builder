/**
 * Types de structures disponibles
 */
export const STRUCTURE_TYPES = [
  { id: 'MECS', label: 'MECS', description: 'Maison d\'Enfants à Caractère Social' },
  { id: 'SISEIP', label: 'SISEIP', description: 'Service d\'Intervention Sociale et Éducative en Placement' },
  { id: 'ITEP', label: 'ITEP', description: 'Institut Thérapeutique, Éducatif et Pédagogique' },
  { id: 'Autre', label: 'Autre', description: 'Autre type de structure' }
];

/**
 * Limites disponibles pour le nombre d'utilisateurs par structure
 */
export const USER_LIMITS = [
  { value: 10, label: '10 utilisateurs' },
  { value: 25, label: '25 utilisateurs' },
  { value: 50, label: '50 utilisateurs' },
  { value: 100, label: '100 utilisateurs' },
  { value: 250, label: '250 utilisateurs' },
  { value: 500, label: '500 utilisateurs' }
];

/**
 * Options de mode pour les éducateurs
 */
export const EDUCATEUR_MODES = [
  { id: 'normal', label: 'Normal', description: 'Accès complet aux fonctionnalités' },
  { id: 'test', label: 'Test', description: 'Compte de test avec données fictives' },
  { id: 'demo', label: 'Démo', description: 'Compte de démonstration avec accès limité' }
];

/**
 * Rôles disponibles pour les éducateurs
 */
export const EDUCATEUR_ROLES = [
  { 
    id: 'educateur', 
    label: 'Éducateur', 
    description: 'Peut accéder aux données de sa structure',
    color: 'purple'
  },
  { 
    id: 'admin', 
    label: 'Administrateur', 
    description: 'Peut gérer les éducateurs et les données de sa structure',
    color: 'amber'
  },
  { 
    id: 'super_admin', 
    label: 'Super Admin', 
    description: 'Peut gérer toutes les structures et tous les utilisateurs',
    color: 'red'
  },
  { 
    id: 'user', 
    label: 'Utilisateur', 
    description: 'Accès limité aux fonctionnalités de base',
    color: 'blue'
  }
];