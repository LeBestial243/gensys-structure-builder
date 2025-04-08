-- Création d'une fonction d'administration pour contourner RLS
CREATE OR REPLACE FUNCTION admin_insert_jeune(jeune_data JSONB)
RETURNS JSONB
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insérer directement avec SECURITY DEFINER (contourne RLS)
  INSERT INTO jeunes (
    prenom, 
    nom, 
    date_naissance, 
    dossier_complet,
    structure_manuelle,
    dossiers
  ) VALUES (
    jeune_data->>'prenom',
    jeune_data->>'nom',
    (jeune_data->>'date_naissance')::DATE,
    COALESCE((jeune_data->>'dossier_complet')::BOOLEAN, false),
    jeune_data->>'structure_manuelle',
    jeune_data->'dossiers'
  )
  RETURNING to_jsonb(jeunes.*) INTO result;
  
  RETURN result;
END;
$$;

-- Fonction plus simple pour créer un jeune sans structure_id
CREATE OR REPLACE FUNCTION create_jeune_without_structure(jeune_data JSONB)
RETURNS JSONB
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insérer le jeune sans structure_id
  INSERT INTO jeunes (
    prenom, 
    nom, 
    date_naissance, 
    dossier_complet,
    structure_manuelle,
    dossiers
  ) VALUES (
    jeune_data->>'prenom',
    jeune_data->>'nom',
    (jeune_data->>'date_naissance')::DATE,
    COALESCE((jeune_data->>'dossier_complet')::BOOLEAN, false),
    jeune_data->>'structure_manuelle',
    jeune_data->'dossiers'
  )
  RETURNING to_jsonb(jeunes.*) INTO result;
  
  RETURN result;
END;
$$;