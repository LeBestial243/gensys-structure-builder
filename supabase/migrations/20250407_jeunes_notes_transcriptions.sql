-- =========================================
-- Création des tables pour le système GenSys
-- Tables: jeunes, notes, transcriptions, evenements
-- Date: 2025-04-07
-- =========================================

-- Table des jeunes
CREATE TABLE IF NOT EXISTS jeunes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  date_naissance DATE NOT NULL,
  structure_id UUID NOT NULL REFERENCES structures(id) ON DELETE CASCADE,
  dossier_complet BOOLEAN NOT NULL DEFAULT false,
  dossiers JSONB, -- Pour stocker les types de dossiers personnalisés
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table des notes éducatives
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre VARCHAR(255) NOT NULL,
  contenu TEXT NOT NULL,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  jeune_id UUID NOT NULL REFERENCES jeunes(id) ON DELETE CASCADE,
  educateur_id UUID NOT NULL REFERENCES educateurs(id) ON DELETE CASCADE,
  structure_id UUID NOT NULL REFERENCES structures(id) ON DELETE CASCADE
);

-- Table des transcriptions d'entretiens
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contenu TEXT NOT NULL,
  date_entretien TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  validee BOOLEAN NOT NULL DEFAULT false,
  jeune_id UUID NOT NULL REFERENCES jeunes(id) ON DELETE CASCADE,
  educateur_id UUID NOT NULL REFERENCES educateurs(id) ON DELETE CASCADE,
  structure_id UUID NOT NULL REFERENCES structures(id) ON DELETE CASCADE
);

-- Table des événements
CREATE TABLE IF NOT EXISTS evenements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('rdv', 'anniversaire', 'echeance', 'autre')),
  jeune_id UUID NOT NULL REFERENCES jeunes(id) ON DELETE CASCADE,
  structure_id UUID NOT NULL REFERENCES structures(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX IF NOT EXISTS jeunes_structure_id_idx ON jeunes(structure_id);
CREATE INDEX IF NOT EXISTS notes_jeune_id_idx ON notes(jeune_id);
CREATE INDEX IF NOT EXISTS notes_structure_id_idx ON notes(structure_id);
CREATE INDEX IF NOT EXISTS transcriptions_jeune_id_idx ON transcriptions(jeune_id);
CREATE INDEX IF NOT EXISTS transcriptions_structure_id_idx ON transcriptions(structure_id);
CREATE INDEX IF NOT EXISTS evenements_jeune_id_idx ON evenements(jeune_id);
CREATE INDEX IF NOT EXISTS evenements_structure_id_idx ON evenements(structure_id);
CREATE INDEX IF NOT EXISTS evenements_date_idx ON evenements(date);

-- RLS (Row Level Security)
ALTER TABLE jeunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

-- Politique pour les jeunes
-- Les super_admin peuvent tout faire
CREATE POLICY "super_admin_can_do_everything_on_jeunes" ON jeunes
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Les admins/éducateurs peuvent voir et manipuler les jeunes de leur structure
CREATE POLICY "users_can_manage_own_structure_jeunes" ON jeunes
  USING (auth.jwt() ->> 'structure_id' = structure_id::text);

-- Politique pour les notes
-- Les super_admin peuvent tout faire
CREATE POLICY "super_admin_can_do_everything_on_notes" ON notes
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Les utilisateurs peuvent voir et manipuler les notes de leur structure
CREATE POLICY "users_can_manage_own_structure_notes" ON notes
  USING (auth.jwt() ->> 'structure_id' = structure_id::text);

-- Politique pour les transcriptions
-- Les super_admin peuvent tout faire
CREATE POLICY "super_admin_can_do_everything_on_transcriptions" ON transcriptions
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Les utilisateurs peuvent voir et manipuler les transcriptions de leur structure
CREATE POLICY "users_can_manage_own_structure_transcriptions" ON transcriptions
  USING (auth.jwt() ->> 'structure_id' = structure_id::text);

-- Politique pour les événements
-- Les super_admin peuvent tout faire
CREATE POLICY "super_admin_can_do_everything_on_evenements" ON evenements
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Les utilisateurs peuvent voir et manipuler les événements de leur structure
CREATE POLICY "users_can_manage_own_structure_evenements" ON evenements
  USING (auth.jwt() ->> 'structure_id' = structure_id::text);