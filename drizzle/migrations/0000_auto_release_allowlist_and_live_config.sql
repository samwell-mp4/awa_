-- 1) Novo usuário: se o email/celular estiver liberado pelo admin, já entra com acesso premium
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

  IF EXISTS (
    SELECT 1 FROM public.login_allowlist a
    WHERE (a.email IS NOT NULL AND lower(a.email) = lower(COALESCE(NEW.email, '')))
       OR (a.phone IS NOT NULL AND a.phone = COALESCE(NEW.phone, ''))
  ) THEN
    INSERT INTO public.user_roles (user_id, role, expires_at)
    VALUES (NEW.id, 'premium', NULL)
    ON CONFLICT (user_id, role) DO UPDATE SET expires_at = NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Atualização em tempo real das configurações de site e assinaturas
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_config;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dictionary_entries;
ALTER TABLE public.site_config REPLICA IDENTITY FULL;
