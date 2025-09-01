-- Add function to get all obstacles for the current user
CREATE OR REPLACE FUNCTION get_user_obstacles()
RETURNS TABLE (
    id UUID,
    task_id UUID,
    project_id UUID,
    description TEXT,
    emotional_state TEXT,
    frustration_level INTEGER,
    time_spent_minutes INTEGER,
    time_remaining_seconds INTEGER,
    ai_solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Return all obstacles for the current user
    RETURN QUERY
    SELECT 
        obs.id,
        obs.task_id,
        obs.project_id,
        obs.description,
        obs.emotional_state,
        obs.frustration_level,
        obs.time_spent_minutes,
        obs.time_remaining_seconds,
        obs.ai_solution,
        obs.created_at
    FROM task_obstacles obs
    WHERE obs.user_id = auth.uid()
    ORDER BY obs.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_obstacles() TO authenticated;

-- Test the function (optional - remove in production)
-- SELECT * FROM get_user_obstacles();
