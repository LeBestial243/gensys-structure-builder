-- Migration pour créer des politiques spéciales pour les super_admin

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "super_admin_full_access_jeunes" ON jeunes;
DROP POLICY IF EXISTS "super_admin_full_access_notes" ON notes;
DROP POLICY IF EXISTS "super_admin_full_access_transcriptions" ON transcriptions;
DROP POLICY IF EXISTS "super_admin_full_access_evenements" ON evenements;
DROP POLICY IF EXISTS "super_admin_full_access_educateurs" ON educateurs;
DROP POLICY IF EXISTS "super_admin_full_access_structures" ON structures;

-- Politiques super_admin pour la table jeunes
CREATE POLICY "super_admin_full_access_jeunes" ON jeunes
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Politique pour les autres rôles (filtre optionnel par structure_id s'il est défini)
DROP POLICY IF EXISTS "users_can_access_jeunes" ON jeunes;
CREATE POLICY "users_can_access_jeunes" ON jeunes
  USING (
    (structure_id IS NULL) OR 
    (auth.jwt() ->> 'structure_id' = structure_id::text AND auth.jwt() ->> 'role' != 'super_admin')
  );

-- Politiques super_admin pour la table notes
CREATE POLICY "super_admin_full_access_notes" ON notes
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Politique pour les autres rôles (filtre optionnel par structure_id s'il est défini)
DROP POLICY IF EXISTS "users_can_access_notes" ON notes;
CREATE POLICY "users_can_access_notes" ON notes
  USING (
    (structure_id IS NULL) OR 
    (auth.jwt() ->> 'structure_id' = structure_id::text AND auth.jwt() ->> 'role' != 'super_admin')
  );

-- Politiques super_admin pour la table transcriptions
CREATE POLICY "super_admin_full_access_transcriptions" ON transcriptions
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Politique pour les autres rôles (filtre optionnel par structure_id s'il est défini)
DROP POLICY IF EXISTS "users_can_access_transcriptions" ON transcriptions;
CREATE POLICY "users_can_access_transcriptions" ON transcriptions
  USING (
    (structure_id IS NULL) OR 
    (auth.jwt() ->> 'structure_id' = structure_id::text AND auth.jwt() ->> 'role' != 'super_admin')
  );

-- Politiques super_admin pour la table evenements
CREATE POLICY "super_admin_full_access_evenements" ON evenements
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Politique pour les autres rôles (filtre optionnel par structure_id s'il est défini)
DROP POLICY IF EXISTS "users_can_access_evenements" ON evenements;
CREATE POLICY "users_can_access_evenements" ON evenements
  USING (
    (structure_id IS NULL) OR 
    (auth.jwt() ->> 'structure_id' = structure_id::text AND auth.jwt() ->> 'role' != 'super_admin')
  );

-- Politiques super_admin pour la table educateurs
CREATE POLICY "super_admin_full_access_educateurs" ON educateurs
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Politique pour les autres rôles
DROP POLICY IF EXISTS "users_can_access_educateurs" ON educateurs;
CREATE POLICY "users_can_access_educateurs" ON educateurs
  USING (
    auth.jwt() ->> 'structure_id' = structure_id::text AND auth.jwt() ->> 'role' != 'super_admin'
  );

-- Politiques super_admin pour la table structures
CREATE POLICY "super_admin_full_access_structures" ON structures
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Politique pour les autres rôles
DROP POLICY IF EXISTS "users_can_access_structures" ON structures;
CREATE POLICY "users_can_access_structures" ON structures
  USING (
    auth.jwt() ->> 'structure_id' = id::text AND auth.jwt() ->> 'role' != 'super_admin'
  );