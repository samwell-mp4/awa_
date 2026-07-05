
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid, _check_env text DEFAULT 'live'::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN _user_id IS DISTINCT FROM auth.uid() THEN false
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN true
    WHEN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'premium'
        AND (expires_at IS NULL OR expires_at > now())
    ) THEN true
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
$function$;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
