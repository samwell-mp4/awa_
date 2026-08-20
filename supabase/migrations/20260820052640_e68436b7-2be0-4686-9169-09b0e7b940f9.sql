UPDATE public.site_config 
SET value = jsonb_set(value, '{h1a}', '"Meus dois domínios"')
WHERE key = 'landing_hero';

UPDATE public.site_config 
SET value = jsonb_set(value, '{h1b}', '""')
WHERE key = 'landing_hero';