ALTER TABLE public.dictionary REPLICA IDENTITY FULL;
ALTER TABLE public.trails REPLICA IDENTITY FULL;
ALTER TABLE public.songs REPLICA IDENTITY FULL;
ALTER TABLE public.daily_mission REPLICA IDENTITY FULL;
ALTER TABLE public.daily_video REPLICA IDENTITY FULL;
ALTER TABLE public.ambient_videos REPLICA IDENTITY FULL;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['dictionary','trails','songs','daily_mission','daily_video','ambient_videos'] LOOP
    NULL;
  END LOOP;
END $$;

DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['dictionary','trails','songs','daily_mission','daily_video','ambient_videos']) LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
END $$;