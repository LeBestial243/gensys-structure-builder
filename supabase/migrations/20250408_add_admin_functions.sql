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
    dossier_complet
  ) VALUES (
    jeune_data->>'prenom',
    jeune_data->>'nom',
    (jeune_data->>'date_naissance')::DATE,
    (jeune_data->>'dossier_complet')::BOOLEAN
  )
  RETURNING to_jsonb(jeunes.*) INTO result;
  
  RETURN result;
END;
$$;