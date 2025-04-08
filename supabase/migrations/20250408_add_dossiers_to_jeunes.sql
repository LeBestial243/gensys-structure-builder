-- Ajout du champ dossiers à la table jeunes
ALTER TABLE jeunes ADD COLUMN IF NOT EXISTS dossiers JSONB;

-- Suppression de la contrainte de clé étrangère structure_id
ALTER TABLE jeunes DROP CONSTRAINT IF EXISTS jeunes_structure_id_fkey;

-- Modification de la table pour rendre structure_id nullable
ALTER TABLE jeunes ALTER COLUMN structure_id DROP NOT NULL;

-- Ajout du champ structure_manuelle
ALTER TABLE jeunes ADD COLUMN IF NOT EXISTS structure_manuelle TEXT;

-- Création d'un index sur structure_manuelle pour optimiser les recherches
CREATE INDEX IF NOT EXISTS jeunes_structure_manuelle_idx ON jeunes(structure_manuelle);