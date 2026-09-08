CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Internal/server contexts (no end-user JWT) and admins may adjust points.
  IF auth.uid() IS NULL
     OR auth.role() = 'service_role'
     OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.id := OLD.id;
  NEW.points := OLD.points;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_fields() FROM anon, authenticated, public;