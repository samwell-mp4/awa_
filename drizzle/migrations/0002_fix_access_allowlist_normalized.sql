-- Normaliza email/telefone na verificação da lista de liberados
CREATE OR REPLACE FUNCTION public.is_login_allowed(_email text, _phone text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.login_allowlist a
    WHERE (
      _email IS NOT NULL AND _email <> ''
      AND lower(regexp_replace(a.email, '\s', '', 'g')) = lower(regexp_replace(_email, '\s', '', 'g'))
    )
    OR (
      _phone IS NOT NULL AND _phone <> '' AND a.phone IS NOT NULL
      AND regexp_replace(a.phone, '\D', '', 'g') = regexp_replace(_phone, '\D', '', 'g')
    )
  );
$$;

-- Verificação única de acesso: admin, liberado pelo admin, premium manual ou assinatura ativa
CREATE OR REPLACE FUNCTION public.is_access_allowed(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_phone text;
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'premium'
      AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND (
        (status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status IN ('canceled','past_due') AND current_period_end IS NOT NULL AND current_period_end > now())
      )
  ) THEN
    RETURN true;
  END IF;

  SELECT email, phone INTO v_email, v_phone FROM auth.users WHERE id = _user_id;
  RETURN public.is_login_allowed(coalesce(v_email, ''), coalesce(v_phone, ''));
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_access_allowed(uuid) TO authenticated, service_role;

-- Normaliza também o acesso por plano (adulto/infantil) via lista de liberados
CREATE OR REPLACE FUNCTION public.has_plan_access(_user_id uuid, _plan text, _check_env text DEFAULT 'live'::text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN true
    WHEN _user_id IS DISTINCT FROM auth.uid() THEN false
    WHEN EXISTS (
      SELECT 1
      FROM auth.users u
      JOIN public.login_allowlist a
        ON (
          a.email IS NOT NULL
          AND lower(regexp_replace(a.email, '\s', '', 'g')) = lower(regexp_replace(coalesce(u.email, ''), '\s', '', 'g'))
          AND coalesce(u.email, '') <> ''
        )
        OR (
          a.phone IS NOT NULL AND coalesce(u.phone, '') <> ''
          AND regexp_replace(a.phone, '\D', '', 'g') = regexp_replace(coalesce(u.phone, ''), '\D', '', 'g')
        )
      WHERE u.id = auth.uid()
        AND (a.plan = 'ambos' OR a.plan = _plan)
    ) THEN true
    WHEN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'premium'
        AND (expires_at IS NULL OR expires_at > now())
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
$$;

-- Concede premium automaticamente no cadastro para quem o admin liberou (com normalização)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, photo_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;

  IF public.is_login_allowed(coalesce(NEW.email, ''), coalesce(NEW.phone, '')) THEN
    INSERT INTO public.user_roles (user_id, role, expires_at)
    VALUES (NEW.id, 'premium', NULL)
    ON CONFLICT (user_id, role) DO UPDATE SET expires_at = NULL;
  END IF;

  RETURN NEW;
END;
$$;