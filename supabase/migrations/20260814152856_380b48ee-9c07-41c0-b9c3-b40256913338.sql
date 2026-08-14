
-- Configurações globais e visuais do site
CREATE TABLE IF NOT EXISTS public.site_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Permissões
GRANT SELECT ON public.site_config TO anon;
GRANT SELECT ON public.site_config TO authenticated;
GRANT ALL ON public.site_config TO service_role;

-- RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage site_config') THEN
        CREATE POLICY "Admins can manage site_config"
        ON public.site_config
        FOR ALL
        TO authenticated
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Everyone can read site_config') THEN
        CREATE POLICY "Everyone can read site_config"
        ON public.site_config
        FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;

-- Dados iniciais (Infantil Hotspots)
INSERT INTO public.site_config (key, value)
VALUES ('infantil_hotspots', '[
  {"to": "/trilhas-infantil", "key": "trilhas", "emoji": "🗺️", "color": "#06d6a0"},
  {"to": "/musicas-infantil", "key": "cantico", "emoji": "🎶", "color": "#ef476f"},
  {"to": "/historias-infantil", "key": "historia", "emoji": "📖", "color": "#f4a261"},
  {"to": "/jogos-infantil", "key": "jogos", "emoji": "🎮", "color": "#118ab2"},
  {"to": "/amizade", "key": "amizade", "emoji": "💛", "color": "#c77dff"}
]')
ON CONFLICT (key) DO NOTHING;

-- Identidade visual (Logos e Vídeos)
INSERT INTO public.site_config (key, value)
VALUES ('branding', '{
  "infantil_logo_url": "/__l5e/assets-v1/96d8b0ab-eccd-460d-adce-ce798a64e2f9/infantil-logo-new.jpg",
  "infantil_menu_video_url": "/__l5e/assets-v1/71a5c687-2591-4e78-8314-e0c90c765950/infantil-menu-video.mp4",
  "adulto_logo_url": "/__l5e/assets-v1/b63a81e3-e91b-4e41-8110-ee8404ec59b9/adulto-logo.png"
}')
ON CONFLICT (key) DO NOTHING;
