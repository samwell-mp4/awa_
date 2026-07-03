
CREATE TABLE public.learning_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trail text,
  action text NOT NULL DEFAULT 'learn_word',
  points integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX learning_events_created_at_idx ON public.learning_events (created_at DESC);
CREATE INDEX learning_events_user_created_idx ON public.learning_events (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.learning_events TO authenticated;
GRANT ALL ON public.learning_events TO service_role;

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view learning events"
  ON public.learning_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users insert own learning events"
  ON public.learning_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.weekly_top_learners(_limit integer DEFAULT 10)
RETURNS TABLE (user_id uuid, name text, photo_url text, points bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.user_id,
         COALESCE(p.name, 'Aprendiz'),
         p.photo_url,
         SUM(e.points)::bigint AS points
  FROM public.learning_events e
  LEFT JOIN public.profiles p ON p.id = e.user_id
  WHERE e.created_at >= date_trunc('week', now())
  GROUP BY e.user_id, p.name, p.photo_url
  ORDER BY points DESC, e.user_id
  LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.weekly_top_learners(integer) TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_events;
