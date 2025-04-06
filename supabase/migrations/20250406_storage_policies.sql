-- Configuration du stockage pour les logos des structures

-- Création du bucket de stockage si nécessaire
INSERT INTO storage.buckets (id, name, public)
VALUES ('structures', 'structures', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de sécurité pour le bucket structures
-- Permettre à tous de lire les logos publics
CREATE POLICY "Allow public read access to structures logos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'structures');

-- Politiques d'insertion - Seuls les admins et super_admins peuvent ajouter des logos
CREATE POLICY "Allow admins and superadmins to upload structure logos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'structures' AND
    (auth.role() = 'admin' OR auth.role() = 'super_admin')
  );

-- Politiques de mise à jour - Seuls les admins de leur structure et les super_admins peuvent modifier les logos
CREATE POLICY "Allow admins to update their structure logo" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'structures' AND
    (
      (auth.role() = 'admin' AND path LIKE auth.jwt()->'structure_id' || '/%') OR
      auth.role() = 'super_admin'
    )
  );

-- Politiques de suppression - Seuls les super_admins peuvent supprimer les logos
CREATE POLICY "Only super_admins can delete structure logos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'structures' AND
    auth.role() = 'super_admin'
  );