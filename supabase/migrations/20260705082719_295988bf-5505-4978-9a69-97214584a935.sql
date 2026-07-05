
-- Rewrite has_premium_access with inlined subscription check (SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid, _check_env text DEFAULT 'live'::text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN _user_id IS DISTINCT FROM auth.uid() THEN false
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN true
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'premium') THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = auth.uid()
        AND environment = _check_env
        AND (
          (status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now()))
          OR (status = 'past_due' AND current_period_end IS NOT NULL AND current_period_end > now() - interval '3 days')
          OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > now())
        )
    )
  END;
$$;

-- Lock down has_active_subscription (SECURITY DEFINER) so signed-in users cannot execute it
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon, authenticated;

-- Lock down weekly_top_learners (SECURITY DEFINER); now only callable by service_role
REVOKE ALL ON FUNCTION public.weekly_top_learners(integer) FROM PUBLIC, anon, authenticated;
