CREATE TABLE public.assistant_misses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  question text,
  user_id uuid,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_misses TO authenticated;
GRANT ALL ON public.assistant_misses TO service_role;
ALTER TABLE public.assistant_misses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users log own misses" ON public.assistant_misses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read misses" ON public.assistant_misses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update misses" ON public.assistant_misses FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete misses" ON public.assistant_misses FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX assistant_misses_created_idx ON public.assistant_misses (created_at DESC);