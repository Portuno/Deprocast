-- Add task completion tracking fields to micro_tasks table
-- This migration adds fields to track task completion data for the Pomodoro+ protocol

-- Add new columns for task completion tracking
ALTER TABLE micro_tasks 
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS motivation_before INTEGER CHECK (motivation_before >= 1 AND motivation_before <= 10),
ADD COLUMN IF NOT EXISTS motivation_after INTEGER CHECK (motivation_after >= 1 AND motivation_after <= 10),
ADD COLUMN IF NOT EXISTS dopamine_rating INTEGER CHECK (dopamine_rating >= 1 AND dopamine_rating <= 10),
ADD COLUMN IF NOT EXISTS next_task_motivation INTEGER CHECK (next_task_motivation >= 1 AND next_task_motivation <= 10),
ADD COLUMN IF NOT EXISTS breakthrough_moments TEXT,
ADD COLUMN IF NOT EXISTS obstacles_encountered JSONB DEFAULT '[]'::jsonb;

-- Add comments to document the new fields
COMMENT ON COLUMN micro_tasks.completion_date IS 'Timestamp when the task was completed';
COMMENT ON COLUMN micro_tasks.actual_time_minutes IS 'Actual time spent on the task in minutes';
COMMENT ON COLUMN micro_tasks.motivation_before IS 'Motivation level before starting the task (1-10 scale)';
COMMENT ON COLUMN micro_tasks.motivation_after IS 'Motivation level after completing the task (1-10 scale)';
COMMENT ON COLUMN micro_tasks.dopamine_rating IS 'Dopamine rating after task completion (1-10 scale)';
COMMENT ON COLUMN micro_tasks.next_task_motivation IS 'Motivation level for the next task (1-10 scale)';
COMMENT ON COLUMN micro_tasks.breakthrough_moments IS 'Text describing any breakthrough moments or insights';
COMMENT ON COLUMN micro_tasks.obstacles_encountered IS 'JSON array of obstacles encountered during the task';

-- Create an index on completion_date for better query performance
CREATE INDEX IF NOT EXISTS idx_micro_tasks_completion_date ON micro_tasks(completion_date);

-- Create an index on status for filtering tasks
CREATE INDEX IF NOT EXISTS idx_micro_tasks_status ON micro_tasks(status);

-- Add a function to update task completion data
CREATE OR REPLACE FUNCTION update_task_completion(
    p_task_id UUID,
    p_completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
        completion_date = p_completion_date,
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

-- Add a function to get task completion statistics
CREATE OR REPLACE FUNCTION get_task_completion_stats(p_project_id UUID DEFAULT NULL)
RETURNS TABLE(
    total_tasks BIGINT,
    completed_tasks BIGINT,
    avg_motivation_before NUMERIC,
    avg_motivation_after NUMERIC,
    avg_dopamine_rating NUMERIC,
    avg_next_task_motivation NUMERIC,
    total_sessions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::BIGINT as completed_tasks,
        AVG(motivation_before)::NUMERIC as avg_motivation_before,
        AVG(motivation_after)::NUMERIC as avg_motivation_after,
        AVG(dopamine_rating)::NUMERIC as avg_dopamine_rating,
        AVG(next_task_motivation)::NUMERIC as avg_next_task_motivation,
        COUNT(CASE WHEN completion_date IS NOT NULL THEN 1 END)::BIGINT as total_sessions
    FROM micro_tasks 
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Add a function to get productivity insights
CREATE OR REPLACE FUNCTION get_productivity_insights(p_project_id UUID DEFAULT NULL, p_days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    tasks_completed BIGINT,
    avg_motivation_increase NUMERIC,
    total_obstacles BIGINT,
    breakthrough_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(completion_date) as date,
        COUNT(*)::BIGINT as tasks_completed,
        AVG(motivation_after - motivation_before)::NUMERIC as avg_motivation_increase,
        COUNT(CASE WHEN obstacles_encountered != '[]'::jsonb THEN 1 END)::BIGINT as total_obstacles,
        COUNT(CASE WHEN breakthrough_moments IS NOT NULL AND breakthrough_moments != '' THEN 1 END)::BIGINT as breakthrough_count
    FROM micro_tasks 
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND status = 'completed'
    AND completion_date >= NOW() - INTERVAL '1 day' * p_days_back
    GROUP BY DATE(completion_date)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_task_completion(UUID, TIMESTAMP WITH TIME ZONE, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_completion_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_productivity_insights(UUID, INTEGER) TO authenticated;

-- Add a trigger to automatically update updated_at when task is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_micro_tasks_updated_at') THEN
        CREATE TRIGGER update_micro_tasks_updated_at
            BEFORE UPDATE ON micro_tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert sample data for testing (optional)
-- INSERT INTO micro_tasks (
--     id, project_id, title, description, status, priority, 
--     completion_date, actual_time_minutes, motivation_before, 
--     motivation_after, dopamine_rating, next_task_motivation
-- ) VALUES (
--     gen_random_uuid(), 
--     (SELECT id FROM projects LIMIT 1), 
--     'Sample Completed Task', 
--     'This is a sample task for testing completion tracking', 
--     'completed', 
--     'medium',
--     NOW(),
--     25,
--     6,
--     8,
--     7,
--     7
-- );

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
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
