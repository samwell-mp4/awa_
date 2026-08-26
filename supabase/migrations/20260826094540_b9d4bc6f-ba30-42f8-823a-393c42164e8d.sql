CREATE TABLE IF NOT EXISTS public.dictionary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction text NOT NULL,
  term_pt text NOT NULL,
  term_patxoha text NOT NULL,
  category text NOT NULL DEFAULT 'Outros',
  subcategory text,
  word_type text,
  variant text,
  note text,
  example text,
  audio_url text,
  image_url text,
  source text NOT NULL DEFAULT 'Dicionário Patxôhã 2015',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dictionary_entries_direction_idx ON public.dictionary_entries (direction);
CREATE INDEX IF NOT EXISTS dictionary_entries_pt_idx ON public.dictionary_entries USING gin (term_pt gin_trgm_ops);
CREATE INDEX IF NOT EXISTS dictionary_entries_pat_idx ON public.dictionary_entries USING gin (term_patxoha gin_trgm_ops);

GRANT SELECT ON public.dictionary_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dictionary_entries TO authenticated;
GRANT ALL ON public.dictionary_entries TO service_role;

ALTER TABLE public.dictionary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dictionary_entries public read"
ON public.dictionary_entries FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "dictionary_entries admin write"
ON public.dictionary_entries FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER dictionary_entries_touch_updated_at
BEFORE UPDATE ON public.dictionary_entries
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();