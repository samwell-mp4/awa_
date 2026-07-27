-- Tabela de liberação de acesso (whitelist)
CREATE TABLE public.login_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT login_allowlist_at_least_one CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE UNIQUE INDEX login_allowlist_email_idx ON public.login_allowlist (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX login_allowlist_phone_idx ON public.login_allowlist (phone) WHERE phone IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.login_allowlist TO authenticated;
GRANT ALL ON public.login_allowlist TO service_role;

ALTER TABLE public.login_allowlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allowlist admin all" ON public.login_allowlist
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Função: verifica se um email/telefone tem acesso liberado
CREATE OR REPLACE FUNCTION public.is_login_allowed(_email text, _phone text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    lower(coalesce(_email, '')) = 'adlermagno8@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.login_allowlist
      WHERE (_email IS NOT NULL AND lower(email) = lower(_email))
         OR (_phone IS NOT NULL AND phone = _phone)
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_login_allowed(text, text) TO authenticated, anon, service_role;

-- Trigger BEFORE INSERT em auth.users: bloqueia cadastros não liberados
CREATE OR REPLACE FUNCTION public.enforce_login_allowlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_login_allowed(NEW.email, NEW.phone) THEN
    RAISE EXCEPTION 'Acesso não liberado. Contate o administrador do AWÃ TECH para ser incluído na lista de acesso.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_login_allowlist_trg ON auth.users;
CREATE TRIGGER enforce_login_allowlist_trg
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_login_allowlist();