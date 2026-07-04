
ALTER TABLE public.dictionary
  ADD COLUMN IF NOT EXISTS term_pt_en text,
  ADD COLUMN IF NOT EXISTS term_pt_es text,
  ADD COLUMN IF NOT EXISTS example_en text,
  ADD COLUMN IF NOT EXISTS example_es text;

ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_es text,
  ADD COLUMN IF NOT EXISTS artist_en text,
  ADD COLUMN IF NOT EXISTS artist_es text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_es text,
  ADD COLUMN IF NOT EXISTS lyrics_pt_en text,
  ADD COLUMN IF NOT EXISTS lyrics_pt_es text;

ALTER TABLE public.daily_mission
  ADD COLUMN IF NOT EXISTS question_en text,
  ADD COLUMN IF NOT EXISTS question_es text,
  ADD COLUMN IF NOT EXISTS options_en jsonb,
  ADD COLUMN IF NOT EXISTS options_es jsonb;

ALTER TABLE public.daily_video
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_es text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_es text;

ALTER TABLE public.trails
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_es text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_es text;

ALTER TABLE public.ambient_videos
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_es text;
