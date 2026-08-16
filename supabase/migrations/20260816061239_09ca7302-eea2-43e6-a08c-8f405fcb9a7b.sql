CREATE TABLE IF NOT EXISTS public.site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_config TO authenticated;
GRANT ALL ON public.site_config TO service_role;

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage site config" ON public.site_config;
CREATE POLICY "Admins can manage site config"
ON public.site_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_config (key, value)
VALUES 
  ('infantil_hotspots', '[{"to": "/trilhas-infantil", "key": "trilhas", "emoji": "🗺️", "color": "#06d6a0"}, {"to": "/musicas-infantil", "key": "cantico", "emoji": "🎶", "color": "#ef476f"}, {"to": "/historias-infantil", "key": "historia", "emoji": "📖", "color": "#f4a261"}, {"to": "/jogos-infantil", "key": "jogos", "emoji": "🎮", "color": "#118ab2"}, {"to": "/amizade", "key": "amizade", "emoji": "💛", "color": "#c77dff"}]'::jsonb),
  ('branding', '{"infantil_logo_url": "https://id-preview--cfdbbb9a-edd7-452e-9fc4-bae47d567950.lovable.app/assets/infantil-logo-new.jpg", "adulto_logo_url": "https://id-preview--cfdbbb9a-edd7-452e-9fc4-bae47d567950.lovable.app/assets/adulto-logo.png", "infantil_menu_video_url": "https://id-preview--cfdbbb9a-edd7-452e-9fc4-bae47d567950.lovable.app/assets/infantil-menu-video.mp4"}'::jsonb)
ON CONFLICT (key) DO NOTHING;