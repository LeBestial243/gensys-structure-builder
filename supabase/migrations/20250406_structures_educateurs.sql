-- Création de la table des structures
CREATE TABLE IF NOT EXISTS structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('MECS', 'SISEIP', 'ITEP', 'Autre')),
  city VARCHAR(100) NOT NULL,
  logo_url TEXT,
  max_users INTEGER NOT NULL DEFAULT 50 CHECK (max_users > 0 AND max_users <= 500),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Création de la table des éducateurs
CREATE TABLE IF NOT EXISTS educateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL, 
  email VARCHAR(255) NOT NULL UNIQUE,
  structure_id UUID NOT NULL REFERENCES structures(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'educateur' CHECK (role IN ('educateur', 'admin', 'super_admin', 'user')),
  mode VARCHAR(50) DEFAULT 'normal' CHECK (mode IN ('normal', 'test', 'demo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Création des index
CREATE INDEX IF NOT EXISTS educateurs_structure_id_idx ON educateurs(structure_id);
CREATE INDEX IF NOT EXISTS educateurs_email_idx ON educateurs(email);

-- Configuration de la RLS (Row Level Security)
-- Activer RLS sur les tables
ALTER TABLE structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE educateurs ENABLE ROW LEVEL SECURITY;

-- Politique pour les structures
-- Les super_admin peuvent tout faire
CREATE POLICY "super_admin_can_do_everything_on_structures" ON structures
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Les admins peuvent voir leurs propres structures
CREATE POLICY "admins_can_view_own_structure" ON structures
  FOR SELECT
  USING (auth.jwt() ->> 'structure_id' = id::text AND auth.jwt() ->> 'role' = 'admin');

-- Les éducateurs peuvent voir leur propre structure
CREATE POLICY "educateurs_can_view_own_structure" ON structures
  FOR SELECT
  USING (auth.jwt() ->> 'structure_id' = id::text);

-- Politique pour les éducateurs
-- Les super_admin peuvent tout faire
CREATE POLICY "super_admin_can_do_everything_on_educateurs" ON educateurs
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Les admins peuvent tout faire avec les éducateurs de leur structure
CREATE POLICY "admins_can_manage_own_structure_educateurs" ON educateurs
  USING (auth.jwt() ->> 'structure_id' = structure_id::text AND auth.jwt() ->> 'role' = 'admin');

-- Les éducateurs peuvent voir les autres éducateurs de leur structure
CREATE POLICY "educateurs_can_view_own_structure_educateurs" ON educateurs
  FOR SELECT
  USING (auth.jwt() ->> 'structure_id' = structure_id::text);