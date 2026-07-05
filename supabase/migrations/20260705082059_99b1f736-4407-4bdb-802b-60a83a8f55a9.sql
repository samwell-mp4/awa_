
-- 1) Videos bucket: restrict to admins only (uploads and reads).
DROP POLICY IF EXISTS "videos read owner or admin" ON storage.objects;
DROP POLICY IF EXISTS "videos insert owner" ON storage.objects;
DROP POLICY IF EXISTS "videos update owner or admin" ON storage.objects;
DROP POLICY IF EXISTS "videos delete owner or admin" ON storage.objects;

CREATE POLICY "videos admin read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "videos admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "videos admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "videos admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));

-- 2) Lock down SECURITY DEFINER functions that should NOT be callable
-- directly from the Data API by anon/authenticated. Email queue plumbing is
-- invoked only by pg_cron/service_role; handle_new_user is a trigger only;
-- move_to_dlq is internal.
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 3) Restrict subscription/leaderboard helpers to signed-in users only
-- (previously executable by anon via PUBLIC grant).
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.weekly_top_learners(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.weekly_top_learners(integer) TO authenticated;
