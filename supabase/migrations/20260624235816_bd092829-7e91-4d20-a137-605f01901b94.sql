
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Aprendiz',
  photo_url text,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles readable by all" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, photo_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ UPDATED_AT helper ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ TRAILS ============
CREATE TABLE public.trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  order_index integer NOT NULL DEFAULT 0,
  default_progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trails TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.trails TO authenticated;
GRANT ALL ON public.trails TO service_role;
ALTER TABLE public.trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trails public read" ON public.trails FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "trails admin write" ON public.trails FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trails_touch BEFORE UPDATE ON public.trails FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ DAILY VIDEO ============
CREATE TABLE public.daily_video (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  duration_minutes integer DEFAULT 3,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_video TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.daily_video TO authenticated;
GRANT ALL ON public.daily_video TO service_role;
ALTER TABLE public.daily_video ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video public read" ON public.daily_video FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "video admin write" ON public.daily_video FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER daily_video_touch BEFORE UPDATE ON public.daily_video FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ DAILY MISSION ============
CREATE TABLE public.daily_mission (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_index integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_mission TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.daily_mission TO authenticated;
GRANT ALL ON public.daily_mission TO service_role;
ALTER TABLE public.daily_mission ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mission public read" ON public.daily_mission FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "mission admin write" ON public.daily_mission FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER daily_mission_touch BEFORE UPDATE ON public.daily_mission FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ DICTIONARY ============
CREATE TABLE public.dictionary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_indigenous text NOT NULL,
  term_pt text NOT NULL,
  language text NOT NULL DEFAULT 'Tupi-Guarani',
  category text NOT NULL DEFAULT 'Geral',
  pronunciation text,
  example text,
  audio_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dictionary TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.dictionary TO authenticated;
GRANT ALL ON public.dictionary TO service_role;
ALTER TABLE public.dictionary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dict public read" ON public.dictionary FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "dict admin write" ON public.dictionary FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER dictionary_touch BEFORE UPDATE ON public.dictionary FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX dictionary_search_idx ON public.dictionary (language, category);
