ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS sync_offsets float8[];
GRANT SELECT ON public.songs TO authenticated, anon;
GRANT ALL ON public.songs TO service_role;
