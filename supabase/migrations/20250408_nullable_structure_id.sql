-- Rendre structure_id nullable
ALTER TABLE jeunes 
ALTER COLUMN structure_id DROP NOT NULL;

-- Créer une fonction RPC pour insérer un jeune sans structure
CREATE OR REPLACE FUNCTION create_jeune_without_structure(jeune_data JSONB)
RETURNS JSONB
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insérer directement sans exiger structure_id
  INSERT INTO jeunes (
    prenom, 
    nom, 
    date_naissance, 
    dossier_complet,
    dossiers
  ) VALUES (
    jeune_data->>'prenom',
    jeune_data->>'nom',
    (jeune_data->>'date_naissance')::DATE,
    COALESCE((jeune_data->>'dossier_complet')::BOOLEAN, false),
    jeune_data->'dossiers'
  )
  RETURNING to_jsonb(jeunes.*) INTO result;
  
  RETURN result;
END;
$$;

-- Ajouter une policy pour permettre l'insertion par tous les utilisateurs authentifiés
DROP POLICY IF EXISTS allow_insert_jeunes ON jeunes;
CREATE POLICY allow_insert_jeunes ON jeunes FOR INSERT WITH CHECK (true);