
CREATE POLICY "Authenticated can read videos bucket"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated can upload to videos bucket"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated can update own files in videos bucket"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'videos' AND owner = auth.uid())
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated can delete own files in videos bucket"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'videos' AND owner = auth.uid());
