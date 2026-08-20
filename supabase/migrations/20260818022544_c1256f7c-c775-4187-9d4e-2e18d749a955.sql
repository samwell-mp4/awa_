
-- Drop existing function first to allow return type change
DROP FUNCTION IF EXISTS public.weekly_top_learners(int);

-- Function to get weekly top learners
CREATE OR REPLACE FUNCTION public.weekly_top_learners(_limit int DEFAULT 10)
RETURNS TABLE (
    user_id uuid,
    name text,
    photo_url text,
    points int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        id as user_id,
        name,
        photo_url,
        points
    FROM public.profiles
    WHERE points > 0
    ORDER BY points DESC, updated_at DESC
    LIMIT _limit;
$$;

-- Grant permission to execute the function
GRANT EXECUTE ON FUNCTION public.weekly_top_learners(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.weekly_top_learners(int) TO anon;
GRANT EXECUTE ON FUNCTION public.weekly_top_learners(int) TO service_role;
