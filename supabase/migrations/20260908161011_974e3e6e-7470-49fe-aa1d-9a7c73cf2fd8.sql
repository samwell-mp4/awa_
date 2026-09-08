-- 1. Least privilege: reset grants on all public tables
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
           WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- Public content: read for everyone, writes for admins (policy-gated)
GRANT SELECT ON public.ambient_videos, public.daily_mission, public.daily_video,
  public.dictionary, public.dictionary_entries, public.songs, public.trails,
  public.site_config TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ambient_videos, public.daily_mission,
  public.daily_video, public.dictionary, public.dictionary_entries, public.songs,
  public.trails, public.site_config TO authenticated;

-- User-owned data
GRANT SELECT, INSERT ON public.learning_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT SELECT ON public.subscriptions, public.paddle_customers, public.user_roles,
  public.ui_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.login_allowlist TO authenticated;
-- email_send_log, email_send_state, email_unsubscribe_tokens, suppressed_emails:
-- service_role only (no app-facing grants).

-- 2. Scope policies to authenticated instead of the public role
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can read site_config" ON public.site_config;
CREATE POLICY "Everyone can read site_config" ON public.site_config
  FOR SELECT TO anon, authenticated USING (true);

-- 3. Protect gamification points from client-side tampering
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.id := OLD.id;
  NEW.points := OLD.points;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_fields() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS profiles_protect_fields ON public.profiles;
CREATE TRIGGER profiles_protect_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- 4. Missing foreign-key index
CREATE INDEX IF NOT EXISTS songs_ambient_video_id_idx ON public.songs (ambient_video_id);