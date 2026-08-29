-- Plan -> area mapping now includes the Starter/Pro/Advanced tiers.
CREATE OR REPLACE FUNCTION public.has_plan_access(_user_id uuid, _plan text, _check_env text DEFAULT 'live'::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN true
    WHEN _user_id IS DISTINCT FROM auth.uid() THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = auth.uid()
        AND environment = _check_env
        AND (
          -- Plano da própria área (awa_adulto / awa_infantil)
          product_id = 'awa_' || _plan
          OR price_id LIKE 'awa_' || _plan || '_%'
          -- Premium legado: libera tudo
          OR product_id = 'awa_premium'
          OR price_id LIKE 'awa_premium_%'
          -- Pro e Advanced liberam as duas áreas
          OR product_id IN ('awa_pro','awa_advanced')
          OR price_id LIKE 'awa_pro_%'
          OR price_id LIKE 'awa_advanced_%'
          -- Starter libera apenas a área Adulto
          OR (_plan = 'adulto' AND (product_id = 'awa_starter' OR price_id LIKE 'awa_starter_%'))
        )
        AND (
          (status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now()))
          OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > now())
          OR (status = 'past_due' AND (current_period_end IS NULL OR current_period_end > now() - interval '3 days'))
        )
    )
  END;
$function$;

-- One payment-customer record per user PER environment (sandbox rows must not
-- overwrite live rows).
ALTER TABLE public.paddle_customers DROP CONSTRAINT IF EXISTS paddle_customers_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS paddle_customers_user_env_key
  ON public.paddle_customers (user_id, environment);