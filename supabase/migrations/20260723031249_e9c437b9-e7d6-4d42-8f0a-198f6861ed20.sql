
CREATE OR REPLACE FUNCTION public.has_plan_access(_user_id uuid, _plan text, _check_env text DEFAULT 'live')
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = _user_id
        AND environment = _check_env
        AND (
          product_id = 'awa_' || _plan
          OR price_id LIKE 'awa_' || _plan || '_%'
          OR product_id = 'awa_premium'
          OR price_id LIKE 'awa_premium_%'
        )
        AND (
          (status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now()))
          OR (status = 'past_due' AND current_period_end IS NOT NULL AND current_period_end > now() - interval '3 days')
          OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > now())
        )
    )
  END;
$$;

GRANT EXECUTE ON FUNCTION public.has_plan_access(uuid, text, text) TO authenticated, anon, service_role;
