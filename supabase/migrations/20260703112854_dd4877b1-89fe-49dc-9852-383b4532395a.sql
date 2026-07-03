
-- Drop old single-arg has_premium_access to replace with env-aware version
DROP FUNCTION IF EXISTS public.has_premium_access(uuid);

-- Canonical subscription-active check with environment awareness
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid, _check_env text DEFAULT 'live')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND environment = _check_env
      AND (
        (status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'past_due' AND current_period_end IS NOT NULL AND current_period_end > now() - interval '3 days')
        OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > now())
      )
  );
$$;

-- Premium gate: admin bypass OR active subscription in the given env
CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid, _check_env text DEFAULT 'live')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS DISTINCT FROM auth.uid() THEN false
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN true
    ELSE public.has_active_subscription(auth.uid(), _check_env)
  END;
$$;

GRANT EXECUTE ON FUNCTION public.has_premium_access(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated, service_role;
