-- Simple task completion tracking setup
-- This migration adds only the essential columns needed for the Pomodoro+ protocol

-- Add new columns for task completion tracking (only if they don't exist)
DO $$
BEGIN
    -- Add completion_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_tasks' AND column_name = 'completion_date') THEN
        ALTER TABLE micro_tasks ADD COLUMN completion_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add actual_time_minutes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_tasks' AND column_name = 'actual_time_minutes') THEN
        ALTER TABLE micro_tasks ADD COLUMN actual_time_minutes INTEGER;
    END IF;
    
    -- Add motivation_before column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_tasks' AND column_name = 'motivation_before') THEN
        ALTER TABLE micro_tasks ADD COLUMN motivation_before INTEGER CHECK (motivation_before >= 1 AND motivation_before <= 10);
    END IF;
    
    -- Add motivation_after column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_tasks' AND column_name = 'motivation_after') THEN
        ALTER TABLE micro_tasks ADD COLUMN motivation_after INTEGER CHECK (motivation_after >= 1 AND motivation_after <= 10);
    END IF;
    
    -- Add dopamine_rating column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_tasks' AND column_name = 'dopamine_rating') THEN
        ALTER TABLE micro_tasks ADD COLUMN dopamine_rating INTEGER CHECK (dopamine_rating >= 1 AND dopamine_rating <= 10);
    END IF;
    
    -- Add next_task_motivation column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_tasks' AND column_name = 'next_task_motivation') THEN
        ALTER TABLE micro_tasks ADD COLUMN next_task_motivation INTEGER CHECK (next_task_motivation >= 1 AND next_task_motivation <= 10);
    END IF;
    
    -- Add breakthrough_moments column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_tasks' AND column_name = 'breakthrough_moments') THEN
        ALTER TABLE micro_tasks ADD COLUMN breakthrough_moments TEXT;
    END IF;
    
    -- Add obstacles_encountered column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_tasks' AND column_name = 'obstacles_encountered') THEN
        ALTER TABLE micro_tasks ADD COLUMN obstacles_encountered JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Create a simple function to mark a task as completed
CREATE OR REPLACE FUNCTION complete_task_simple(p_task_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE micro_tasks 
    SET 
        status = 'completed',
        completion_date = NOW()
    WHERE id = p_task_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task with ID % not found', p_task_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a simple function to mark a task as in-progress
CREATE OR REPLACE FUNCTION start_task(p_task_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE micro_tasks 
    SET 
        status = 'in-progress'
    WHERE id = p_task_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task with ID % not found', p_task_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a simple function to get next recommended task
CREATE OR REPLACE FUNCTION get_next_recommended_task(p_project_id UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    priority TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mt.id,
        mt.title,
        mt.description,
        mt.priority,
        mt.status
    FROM micro_tasks mt
    WHERE mt.project_id = p_project_id
    AND mt.status = 'pending'
    ORDER BY 
        CASE mt.priority
            WHEN 'high' THEN 3
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 1
        END DESC,
        mt.created_at ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create a simple function to get project statistics
CREATE OR REPLACE FUNCTION get_project_task_stats(p_project_id UUID)
RETURNS TABLE(
    total_tasks BIGINT,
    pending_tasks BIGINT,
    in_progress_tasks BIGINT,
    completed_tasks BIGINT,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::BIGINT as pending_tasks,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END)::BIGINT as in_progress_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::BIGINT as completed_tasks,
        ROUND(
            (COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2
        ) as completion_rate
    FROM micro_tasks 
    WHERE project_id = p_project_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION complete_task_simple(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION start_task(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_recommended_task(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_task_stats(UUID) TO authenticated;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'micro_tasks' 
AND column_name IN (
    'completion_date', 
    'actual_time_minutes', 
    'motivation_before', 
    'motivation_after', 
    'dopamine_rating', 
    'next_task_motivation', 
    'breakthrough_moments', 
    'obstacles_encountered'
)
ORDER BY column_name;

-- Verify the functions were created
SELECT 
    routine_name, 
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'complete_task_simple',
    'start_task',
    'get_next_recommended_task',
    'get_project_task_stats'
)
ORDER BY routine_name;

-- Show success message
SELECT 'Task completion tracking setup completed successfully!' as status;
