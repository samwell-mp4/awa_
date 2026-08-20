
-- Secure has_role function
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

-- Secure has_permission function
REVOKE EXECUTE ON FUNCTION public.has_permission(UUID, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, TEXT) TO authenticated, service_role;
