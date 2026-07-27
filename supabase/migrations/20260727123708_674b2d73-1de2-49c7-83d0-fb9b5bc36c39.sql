-- 1) has_plan_access: só permite consultar sobre si mesmo (ou admin sobre qualquer um)
CREATE OR REPLACE FUNCTION public.has_plan_access(_user_id uuid, _plan text, _check_env text DEFAULT 'live'::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
      EXISTS (
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
    WHEN _user_id IS DISTINCT FROM auth.uid() THEN false
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
          OR (status = 'past_due' AND current_period_end IS NOT NULL AND current_period_end > now() - interval '3 days')
          OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > now())
        )
    )
  END;
$function$;

-- 2) has_active_subscription: não é chamada pelo cliente — remover EXECUTE de authenticated/anon/public
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO service_role;