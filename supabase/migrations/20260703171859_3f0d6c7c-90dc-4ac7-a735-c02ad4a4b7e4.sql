GRANT EXECUTE ON FUNCTION public.weekly_top_learners(integer) TO anon, authenticated;
ALTER TABLE public.learning_events REPLICA IDENTITY FULL;