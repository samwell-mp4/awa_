-- 1) Revoke anon/public EXECUTE on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE ALL ON FUNCTION public.is_login_allowed(text, text) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.weekly_top_learners(integer) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_login_allowlist() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.grant_primary_admin_role() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.weekly_top_learners(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_login_allowed(text, text) TO authenticated;

-- 2) Consolidate duplicated site_config admin policies
DROP POLICY IF EXISTS "Admins can manage site_config" ON public.site_config;

-- 3) Remove blanket public read on the private "songs" storage bucket
DROP POLICY IF EXISTS "Public read songs bucket" ON storage.objects;
DROP POLICY IF EXISTS "songs storage public read" ON storage.objects;

-- 4) Restrict ui_templates reads to admins
DROP POLICY IF EXISTS "Templates visíveis por todos autenticados" ON public.ui_templates;
CREATE POLICY "ui_templates admin read"
ON public.ui_templates
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));