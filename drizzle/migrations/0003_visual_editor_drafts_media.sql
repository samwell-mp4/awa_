CREATE TABLE IF NOT EXISTS public.site_config_drafts (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_config_drafts TO authenticated;
GRANT ALL ON public.site_config_drafts TO service_role;
ALTER TABLE public.site_config_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins manage drafts" ON public.site_config_drafts;
CREATE POLICY "admins manage drafts" ON public.site_config_drafts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.site_config_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value jsonb NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS site_config_versions_key_idx ON public.site_config_versions (key, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.site_config_versions TO authenticated;
GRANT ALL ON public.site_config_versions TO service_role;
ALTER TABLE public.site_config_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins manage versions" ON public.site_config_versions;
CREATE POLICY "admins manage versions" ON public.site_config_versions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text,
  filename text,
  mime_type text,
  width int,
  height int,
  ai_description text,
  ai_tags text[] NOT NULL DEFAULT '{}',
  ai_suggested_pages text[] NOT NULL DEFAULT '{}',
  ai_palette text[] NOT NULL DEFAULT '{}',
  ai_layout_hint text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_library_created_idx ON public.media_library (created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT SELECT ON public.media_library TO anon;
GRANT ALL ON public.media_library TO service_role;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read media" ON public.media_library;
CREATE POLICY "public read media" ON public.media_library
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admins manage media" ON public.media_library;
CREATE POLICY "admins manage media" ON public.media_library
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS style jsonb NOT NULL DEFAULT '{}'::jsonb;

DROP POLICY IF EXISTS "site media read auth" ON storage.objects;
CREATE POLICY "site media read auth" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "site media admin write" ON storage.objects;
CREATE POLICY "site media admin write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "site media admin update" ON storage.objects;
CREATE POLICY "site media admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "site media admin delete" ON storage.objects;
CREATE POLICY "site media admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));
