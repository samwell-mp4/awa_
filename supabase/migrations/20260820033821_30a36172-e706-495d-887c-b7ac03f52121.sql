-- Revogar execução pública de funções críticas para segurança
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO service_role;

-- Se houver outras funções SECURITY DEFINER, revogue o acesso público
-- e garanta apenas para service_role ou papéis específicos se necessário.
