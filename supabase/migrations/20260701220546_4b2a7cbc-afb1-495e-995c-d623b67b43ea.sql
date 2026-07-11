CREATE INDEX IF NOT EXISTS dictionary_language_term_indigenous_idx
ON public.dictionary (language, term_indigenous);

CREATE INDEX IF NOT EXISTS dictionary_category_term_pt_idx
ON public.dictionary (category, term_pt);

CREATE INDEX IF NOT EXISTS trails_order_index_idx
ON public.trails (order_index);

CREATE INDEX IF NOT EXISTS daily_video_active_created_idx
ON public.daily_video (is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS daily_mission_active_created_idx
ON public.daily_mission (is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS songs_active_order_created_idx
ON public.songs (is_active, order_index, created_at DESC);

CREATE INDEX IF NOT EXISTS ambient_videos_id_name_idx
ON public.ambient_videos (id, name);