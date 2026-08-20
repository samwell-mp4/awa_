INSERT INTO public.site_config (key, value)
VALUES 
  ('landing_hero', '{"h1a": "Línguas indígenas,", "h1b": "culturas vivas.", "lead": "Escolha a experiência que combina com você. Trilhas guiadas, dicionário, histórias e jogos — desenvolvidos com respeito e curadoria cultural.", "entrar_label": "Entrar", "bg_url": "https://id-preview--cfdbbb9a-edd7-452e-9fc4-bae47d567950.lovable.app/assets/landing-bg.jpg"}'::jsonb)
ON CONFLICT (key) DO NOTHING;