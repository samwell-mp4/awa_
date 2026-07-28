DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tg.tgname
    FROM pg_trigger tg
    JOIN pg_proc p ON p.oid = tg.tgfoid
    WHERE tg.tgrelid = 'auth.users'::regclass
      AND NOT tg.tgisinternal
      AND p.proname = 'enforce_login_allowlist'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', t.tgname);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.is_login_allowed(_email text, _phone text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT true;
$function$;