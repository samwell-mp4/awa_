CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.songs TO authenticated;
GRANT SELECT ON public.songs TO anon;
GRANT SELECT ON public.site_config TO authenticated;
GRANT SELECT ON public.site_config TO anon;
GRANT SELECT ON public.ui_templates TO authenticated;
GRANT SELECT ON public.ui_templates TO anon;
GRANT SELECT ON public.ambient_videos TO authenticated;
GRANT SELECT ON public.ambient_videos TO anon;
GRANT SELECT ON public.user_permissions TO authenticated;
