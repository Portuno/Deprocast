-- Task status update functions for real-time database updates
-- This migration creates functions to update task status in the database

-- Function to update task status to in-progress
CREATE OR REPLACE FUNCTION update_task_status_in_progress(p_task_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE micro_tasks 
    SET 
        status = 'in-progress',
        updated_at = NOW()
    WHERE id = p_task_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task with ID % not found', p_task_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update task status to completed
CREATE OR REPLACE FUNCTION update_task_status_completed(p_task_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE micro_tasks 
    SET 
        status = 'completed',
        completion_date = NOW(),
        updated_at = NOW()
    WHERE id = p_task_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task with ID % not found', p_task_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update task status to pending
CREATE OR REPLACE FUNCTION update_task_status_pending(p_task_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE micro_tasks 
    SET 
        status = 'pending',
        completion_date = NULL,
        updated_at = NOW()
    WHERE id = p_task_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task with ID % not found', p_task_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update task with completion data
CREATE OR REPLACE FUNCTION update_task_completion_data(
    p_task_id UUID,
    p_actual_time_minutes INTEGER DEFAULT NULL,
    p_motivation_before INTEGER DEFAULT NULL,
    p_motivation_after INTEGER DEFAULT NULL,
    p_dopamine_rating INTEGER DEFAULT NULL,
    p_next_task_motivation INTEGER DEFAULT NULL,
    p_breakthrough_moments TEXT DEFAULT NULL,
    p_obstacles_encountered JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE micro_tasks 
    SET 
        status = 'completed',
        completion_date = NOW(),
        actual_time_minutes = COALESCE(p_actual_time_minutes, actual_time_minutes),
        motivation_before = COALESCE(p_motivation_before, motivation_before),
        motivation_after = COALESCE(p_motivation_after, motivation_after),
        dopamine_rating = COALESCE(p_dopamine_rating, dopamine_rating),
        next_task_motivation = COALESCE(p_next_task_motivation, next_task_motivation),
        breakthrough_moments = COALESCE(p_breakthrough_moments, breakthrough_moments),
        obstacles_encountered = COALESCE(p_obstacles_encountered, obstacles_encountered),
        updated_at = NOW()
    WHERE id = p_task_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task with ID % not found', p_task_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get task by ID
CREATE OR REPLACE FUNCTION get_task_by_id(p_task_id UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    project_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    actual_time_minutes INTEGER,
    motivation_before INTEGER,
    motivation_after INTEGER,
    dopamine_rating INTEGER,
    next_task_motivation INTEGER,
    breakthrough_moments TEXT,
    obstacles_encountered JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mt.id,
        mt.title,
        mt.description,
        mt.status,
        mt.priority,
        mt.project_id,
        mt.created_at,
        mt.updated_at,
        mt.completion_date,
        mt.actual_time_minutes,
        mt.motivation_before,
        mt.motivation_after,
        mt.dopamine_rating,
        mt.next_task_motivation,
        mt.breakthrough_moments,
        mt.obstacles_encountered
    FROM micro_tasks mt
    WHERE mt.id = p_task_id;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh tasks for a project (useful after updates)
CREATE OR REPLACE FUNCTION refresh_project_tasks(p_project_id UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    project_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    actual_time_minutes INTEGER,
    motivation_before INTEGER,
    motivation_after INTEGER,
    dopamine_rating INTEGER,
    next_task_motivation INTEGER,
    breakthrough_moments TEXT,
    obstacles_encountered JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mt.id,
        mt.title,
        mt.description,
        mt.status,
        mt.priority,
        mt.project_id,
        mt.created_at,
        mt.updated_at,
        mt.completion_date,
        mt.actual_time_minutes,
        mt.motivation_before,
        mt.motivation_after,
        mt.dopamine_rating,
        mt.next_task_motivation,
        mt.breakthrough_moments,
        mt.obstacles_encountered
    FROM micro_tasks mt
    WHERE mt.project_id = p_project_id
    ORDER BY 
        CASE mt.status
            WHEN 'in-progress' THEN 1
            WHEN 'pending' THEN 2
            WHEN 'completed' THEN 3
        END,
        CASE mt.priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
        END,
        mt.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for all functions
GRANT EXECUTE ON FUNCTION update_task_status_in_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_task_status_completed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_task_status_pending(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_task_completion_data(UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_project_tasks(UUID) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION update_task_status_in_progress(UUID) IS 'Updates task status to in-progress';
COMMENT ON FUNCTION update_task_status_completed(UUID) IS 'Updates task status to completed with basic completion data';
COMMENT ON FUNCTION update_task_status_pending(UUID) IS 'Updates task status to pending';
COMMENT ON FUNCTION update_task_completion_data(UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, JSONB) IS 'Updates task with full completion data for Pomodoro+ protocol';
COMMENT ON FUNCTION get_task_by_id(UUID) IS 'Gets a single task by ID with all completion data';
COMMENT ON FUNCTION refresh_project_tasks(UUID) IS 'Gets all tasks for a project with current status and completion data';

-- Verify the functions were created
SELECT 
    routine_name, 
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'update_task_status_in_progress',
    'update_task_status_completed',
    'update_task_status_pending',
    'update_task_completion_data',
    'get_task_by_id',
    'refresh_project_tasks'
)
ORDER BY routine_name;

-- Show success message
SELECT 'Task status update functions created successfully!' as status;
