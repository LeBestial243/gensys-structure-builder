-- Configuration des triggers pour lier automatiquement les utilisateurs Supabase Auth aux éducateurs

-- Fonction pour créer un éducateur quand un utilisateur s'inscrit avec le rôle "educateur"
CREATE OR REPLACE FUNCTION public.handle_new_educateur()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.educateurs (id, nom, prenom, email, structure_id, role, mode)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nom inconnu'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Prénom inconnu'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'structure_id', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'educateur'),
    COALESCE(NEW.raw_user_meta_data->>'mode', 'normal')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger après insertion d'un utilisateur dans auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
WHEN (NEW.raw_user_meta_data->>'role' = 'educateur')
EXECUTE FUNCTION public.handle_new_educateur();

-- Fonction pour mettre à jour l'éducateur quand un utilisateur est mis à jour
CREATE OR REPLACE FUNCTION public.handle_educateur_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.educateurs
  SET 
    nom = COALESCE(NEW.raw_user_meta_data->>'last_name', nom),
    prenom = COALESCE(NEW.raw_user_meta_data->>'first_name', prenom),
    email = NEW.email,
    role = COALESCE(NEW.raw_user_meta_data->>'role', role),
    mode = COALESCE(NEW.raw_user_meta_data->>'mode', mode)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger après mise à jour d'un utilisateur dans auth.users
CREATE OR REPLACE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.raw_user_meta_data->>'role' = 'educateur' OR NEW.raw_user_meta_data->>'role' = 'educateur')
EXECUTE FUNCTION public.handle_educateur_update();

-- Fonction pour supprimer l'éducateur quand un utilisateur est supprimé
CREATE OR REPLACE FUNCTION public.handle_educateur_deletion()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.educateurs
  WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger après suppression d'un utilisateur dans auth.users
CREATE OR REPLACE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW
WHEN (OLD.raw_user_meta_data->>'role' = 'educateur')
EXECUTE FUNCTION public.handle_educateur_deletion();