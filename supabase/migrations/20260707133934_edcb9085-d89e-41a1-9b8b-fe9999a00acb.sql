REVOKE ALL ON FUNCTION public.weekly_top_learners(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.weekly_top_learners(integer) TO service_role;