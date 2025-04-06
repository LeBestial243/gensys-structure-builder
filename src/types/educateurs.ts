
export type EducateurRole = 'educateur' | 'admin' | 'super_admin' | 'user';
export type EducateurMode = 'normal' | 'test' | 'demo';

export interface Educateur {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  structure_id: string;
  role: EducateurRole;
  mode?: EducateurMode;
  created_at: string;
}
