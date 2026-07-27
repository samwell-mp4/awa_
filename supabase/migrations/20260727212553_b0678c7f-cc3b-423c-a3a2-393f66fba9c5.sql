
-- Atualiza a função de allowlist para incluir o novo admin principal
CREATE OR REPLACE FUNCTION public.is_login_allowed(_email text, _phone text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    lower(coalesce(_email, '')) IN ('adlermagno8@gmail.com', 'awatech.store@gmail.com')
    OR EXISTS (
      SELECT 1 FROM public.login_allowlist
      WHERE (_email IS NOT NULL AND lower(email) = lower(_email))
         OR (_phone IS NOT NULL AND phone = _phone)
    );
$$;

-- Concede admin automaticamente aos e-mails principais quando eles se cadastrarem
CREATE OR REPLACE FUNCTION public.grant_primary_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(coalesce(NEW.email, '')) IN ('adlermagno8@gmail.com', 'awatech.store@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS grant_primary_admin_role_trg ON auth.users;
CREATE TRIGGER grant_primary_admin_role_trg
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_primary_admin_role();

-- Adiciona à allowlist para redundância / visibilidade no painel
INSERT INTO public.login_allowlist (email, note)
VALUES ('awatech.store@gmail.com', 'Conta administradora principal')
ON CONFLICT DO NOTHING;

-- Se já existir cadastro com esse e-mail, concede admin agora
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
WHERE lower(email) = 'awatech.store@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
