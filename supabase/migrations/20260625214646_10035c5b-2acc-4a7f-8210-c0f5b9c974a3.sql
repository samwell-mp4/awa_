
CREATE TABLE public.ambient_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  video_url text NOT NULL,
  poster_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ambient_videos TO anon, authenticated;
GRANT ALL ON public.ambient_videos TO service_role;
ALTER TABLE public.ambient_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ambient public read" ON public.ambient_videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ambient admin write" ON public.ambient_videos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text,
  language text NOT NULL DEFAULT 'Patxôhã',
  audio_url text NOT NULL,
  cover_url text,
  video_url text,
  ambient_video_id uuid REFERENCES public.ambient_videos(id) ON DELETE SET NULL,
  lyrics_indigenous text NOT NULL DEFAULT '',
  lyrics_pt text NOT NULL DEFAULT '',
  description text,
  duration_seconds integer,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.songs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.songs TO authenticated;
GRANT ALL ON public.songs TO service_role;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "songs public read" ON public.songs FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "songs admin write" ON public.songs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER songs_touch BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
