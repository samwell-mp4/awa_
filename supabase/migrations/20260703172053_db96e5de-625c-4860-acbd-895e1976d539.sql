CREATE POLICY "Authenticated can view all learning events for leaderboard"
ON public.learning_events FOR SELECT
TO authenticated
USING (true);