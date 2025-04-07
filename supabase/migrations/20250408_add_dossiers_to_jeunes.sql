-- Ajout du champ dossiers à la table jeunes
ALTER TABLE jeunes ADD COLUMN IF NOT EXISTS dossiers JSONB;