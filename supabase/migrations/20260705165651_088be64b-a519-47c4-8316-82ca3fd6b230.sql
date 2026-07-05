
-- Remove duplicated indexes on dictionary (equivalent pairs already exist)
DROP INDEX IF EXISTS public.idx_dictionary_category_termpt;
DROP INDEX IF EXISTS public.idx_dictionary_language_termind;
DROP INDEX IF EXISTS public.idx_dictionary_termind;
DROP INDEX IF EXISTS public.dictionary_search_idx;

-- Enable trigram search and add GIN indexes to speed up dictionary lookups
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS dictionary_term_pt_trgm_idx
  ON public.dictionary USING gin (term_pt gin_trgm_ops);

CREATE INDEX IF NOT EXISTS dictionary_term_indigenous_trgm_idx
  ON public.dictionary USING gin (term_indigenous gin_trgm_ops);
