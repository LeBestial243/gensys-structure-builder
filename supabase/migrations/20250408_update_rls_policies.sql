-- Migration pour mettre à jour les politiques RLS pour qu'elles fonctionnent sans structure_id

-- Supprimer les anciennes politiques basées sur structure_id
DROP POLICY IF EXISTS "users_can_manage_own_structure_jeunes" ON jeunes;

-- Créer une nouvelle politique plus permissive pour les jeunes
CREATE POLICY "users_can_manage_all_jeunes" ON jeunes
  USING (true);  -- Permet l'accès à tous les jeunes
  
-- Supprimer et recréer également les politiques pour notes
DROP POLICY IF EXISTS "users_can_manage_own_structure_notes" ON notes;
CREATE POLICY "users_can_manage_all_notes" ON notes
  USING (true);

-- Supprimer et recréer les politiques pour transcriptions
DROP POLICY IF EXISTS "users_can_manage_own_structure_transcriptions" ON transcriptions;
CREATE POLICY "users_can_manage_all_transcriptions" ON transcriptions
  USING (true);

-- Supprimer et recréer les politiques pour événements
DROP POLICY IF EXISTS "users_can_manage_own_structure_evenements" ON evenements;
CREATE POLICY "users_can_manage_all_evenements" ON evenements
  USING (true);

-- Note: Les politiques pour super_admin sont conservées, car elles restent pertinentes