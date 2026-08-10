-- Remove o e-mail pessoal antigo da allowlist e da trigger de admin, mantendo apenas o empresarial.
-- Remove também o e-mail empresarial da trigger de bypass, pois agora ele está devidamente na tabela de allowlist.

CREATE OR REPLACE FUNCTION public.is_login_allowed(_email text, _phone text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.login_allowlist
      WHERE (_email IS NOT NULL AND lower(email) = lower(_email))
         OR (_phone IS NOT NULL AND phone = _phone)
    );
$$;

CREATE OR REPLACE FUNCTION public.grant_primary_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(coalesce(NEW.email, '')) = 'awatech.store@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Limpeza: garante que o e-mail antigo não esteja na tabela de allowlist por acidente
DELETE FROM public.login_allowlist WHERE lower(email) = 'adlermagno8@gmail.com';
