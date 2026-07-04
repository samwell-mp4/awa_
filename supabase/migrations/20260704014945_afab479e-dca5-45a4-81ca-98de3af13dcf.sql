
CREATE INDEX IF NOT EXISTS idx_dictionary_category_termpt ON public.dictionary (category, term_pt);
CREATE INDEX IF NOT EXISTS idx_dictionary_language_termind ON public.dictionary (language, term_indigenous);
CREATE INDEX IF NOT EXISTS idx_dictionary_termind ON public.dictionary (term_indigenous);
CREATE INDEX IF NOT EXISTS idx_daily_mission_active_created ON public.daily_mission (is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trails_order ON public.trails (order_index);
ANALYZE public.dictionary;
ANALYZE public.daily_mission;
ANALYZE public.trails;
