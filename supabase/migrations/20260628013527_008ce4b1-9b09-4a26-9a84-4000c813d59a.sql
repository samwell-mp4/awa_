DO $$ BEGIN
  CREATE POLICY "Public read songs bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'songs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;