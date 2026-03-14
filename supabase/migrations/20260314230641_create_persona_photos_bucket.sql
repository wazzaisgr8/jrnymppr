/*
  # Create persona-photos Storage Bucket

  1. Storage
    - Creates a public `persona-photos` bucket for storing persona avatar images
  2. Security
    - Authenticated users can upload to their own folder (user_id prefix)
    - Public read access so photos render without auth tokens
    - Users can only delete/update their own uploads
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('persona-photos', 'persona-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload persona photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'persona-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view persona photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'persona-photos');

CREATE POLICY "Users can update own persona photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'persona-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own persona photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'persona-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
