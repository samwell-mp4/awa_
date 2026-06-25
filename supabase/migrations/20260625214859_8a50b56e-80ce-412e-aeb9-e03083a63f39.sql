
CREATE POLICY "songs storage public read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'songs');

CREATE POLICY "songs storage admin write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'songs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "songs storage admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'songs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "songs storage admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'songs' AND has_role(auth.uid(), 'admin'::app_role));
