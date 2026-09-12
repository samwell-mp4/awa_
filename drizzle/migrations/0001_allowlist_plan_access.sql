ALTER TABLE public.login_allowlist
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'ambos';

CREATE OR REPLACE FUNCTION public.has_plan_access(_user_id uuid, _plan text, _check_env text DEFAULT 'live'::text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN true
    WHEN _user_id IS DISTINCT FROM auth.uid() THEN false
    WHEN EXISTS (
      SELECT 1
      FROM auth.users u
      JOIN public.login_allowlist a
        ON (a.email IS NOT NULL AND lower(a.email) = lower(u.email))
        OR (a.phone IS NOT NULL AND regexp_replace(a.phone, '\D', '', 'g') = regexp_replace(coalesce(u.phone, ''), '\D', '', 'g') AND coalesce(u.phone, '') <> '')
      WHERE u.id = auth.uid()
        AND (a.plan = 'ambos' OR a.plan = _plan)
    ) THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = auth.uid()
        AND environment = _check_env
        AND (
          product_id = 'awa_' || _plan
          OR price_id LIKE 'awa_' || _plan || '_%'
          OR product_id = 'awa_premium'
          OR price_id LIKE 'awa_premium_%'
        )
        AND (
          (status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now()))
          OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > now())
        )
    )
  END;
$function$;

GRANT EXECUTE ON FUNCTION public.has_plan_access(uuid, text, text) TO authenticated;