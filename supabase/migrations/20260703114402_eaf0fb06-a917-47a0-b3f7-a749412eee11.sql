CREATE OR REPLACE FUNCTION public.has_premium_access(_user_id uuid, _check_env text DEFAULT 'live'::text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN _user_id IS DISTINCT FROM auth.uid() THEN false
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN true
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'premium') THEN true
    ELSE public.has_active_subscription(auth.uid(), _check_env)
  END;
$function$;