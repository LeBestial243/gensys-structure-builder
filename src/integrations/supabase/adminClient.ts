import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// URL Supabase (extrait des variables d'environnement)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://euwulgurffyxhazihriqh.supabase.co';

// Clé de service (à utiliser UNIQUEMENT en développement ou sur le serveur)
// ATTENTION: Ne jamais exposer cette clé en production frontend!
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1d3VsZ3VyZmZ5eGhhemhpcnFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzgyNzk4NywiZXhwIjoyMDU5NDAzOTg3fQ.aITp1uoslC-zaZjoC0cnuGCYKhPc5Ul5TgaWiM9A1WA';

// Création du client Supabase avec les droits admin
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false, // Ne pas persister la session pour ce client admin
      autoRefreshToken: false, // Ne pas rafraîchir automatiquement le token
    },
  }
);

// Pour le débogage uniquement
console.log('Client Supabase Admin initialisé');