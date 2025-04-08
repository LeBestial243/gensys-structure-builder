import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";

/**
 * Récupère le client Supabase approprié en fonction du contexte
 * @param role - Rôle de l'utilisateur courant
 * @returns - Client Supabase (standard ou admin)
 */
export const getClient = (role?: string) => {
  // En développement, utiliser le client admin
  if (process.env.NODE_ENV === 'development') {
    return supabaseAdmin;
  }
  
  // En production, vérifier le rôle
  return role === 'super_admin' ? supabaseAdmin : supabase;
};

/**
 * Récupère le client Supabase basé sur le rôle d'un utilisateur
 * @param user - Utilisateur courant avec un rôle
 * @returns - Client Supabase (standard ou admin)
 */
export const getClientForUser = (user: { role?: string } | null) => {
  if (!user) return supabase;
  return getClient(user.role);
};