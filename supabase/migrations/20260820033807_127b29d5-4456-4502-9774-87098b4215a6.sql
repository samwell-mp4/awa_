-- Criar tabela de templates
CREATE TABLE IF NOT EXISTS public.ui_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('adulto', 'infantil', 'musicas')),
    preview_url TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS e Permissões
ALTER TABLE public.ui_templates ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.ui_templates TO authenticated;
GRANT ALL ON public.ui_templates TO service_role;

CREATE POLICY "Templates visíveis por todos autenticados" 
ON public.ui_templates FOR SELECT TO authenticated USING (true);

-- Inserir modelos iniciais
INSERT INTO public.ui_templates (name, category, preview_url, config) VALUES
('Padrão Natureza', 'adulto', 'https://awa-tech.store/preview/adulto-nature.jpg', '{"style": "natural", "hero": "classic"}'),
('Minimalista Dark', 'adulto', 'https://awa-tech.store/preview/adulto-dark.jpg', '{"style": "dark", "hero": "minimal"}'),
('Aldeia Viva (Pixar)', 'infantil', 'https://awa-tech.store/preview/kids-pixar.jpg', '{"style": "3d", "theme": "jungle"}'),
('Fundo do Rio', 'infantil', 'https://awa-tech.store/preview/kids-river.jpg', '{"style": "2d", "theme": "water"}'),
('Player Tela Cheia', 'musicas', 'https://awa-tech.store/preview/music-fullscreen.jpg', '{"player_mode": "fullscreen", "caption_pos": "center"}'),
('Player Mini', 'musicas', 'https://awa-tech.store/preview/music-mini.jpg', '{"player_mode": "mini", "caption_pos": "bottom"}');

-- Adicionar configurações iniciais em site_config
INSERT INTO public.site_config (key, value) 
VALUES 
('active_template_adulto', '"Padrão Natureza"'),
('active_template_infantil', '"Aldeia Viva (Pixar)"'),
('active_template_musicas', '"Player Tela Cheia"')
ON CONFLICT (key) DO NOTHING;
