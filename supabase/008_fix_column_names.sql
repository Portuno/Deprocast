-- Fix column names to match existing micro_tasks table structure
-- This migration corrects the column references to use the actual column names

-- First, let's check what columns actually exist in micro_tasks
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'micro_tasks' ORDER BY column_name;

-- Drop existing functions and views that have incorrect column references
DROP FUNCTION IF EXISTS get_next_recommended_task(UUID);
DROP FUNCTION IF EXISTS get_project_task_stats(UUID);
DROP FUNCTION IF EXISTS get_daily_productivity_summary(UUID, DATE);
DROP FUNCTION IF EXISTS get_weekly_productivity_trends(UUID, INTEGER);
DROP VIEW IF EXISTS task_completion_summary;

-- Recreate functions with correct column names
CREATE OR REPLACE FUNCTION get_next_recommended_task(p_project_id UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    priority TEXT,
    estimated_time INTEGER,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mt.id,
        mt.title,
        mt.description,
        mt.priority,
        mt.estimated_time,
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

-- Function to get task statistics for a project
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

-- Function to get daily productivity summary
CREATE OR REPLACE FUNCTION get_daily_productivity_summary(p_project_id UUID DEFAULT NULL, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    date DATE,
    tasks_completed BIGINT,
    total_time_spent INTEGER,
    avg_motivation_increase NUMERIC,
    obstacles_encountered BIGINT,
    breakthroughs BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_date as date,
        COUNT(*)::BIGINT as tasks_completed,
        COALESCE(SUM(actual_time_minutes), 0)::INTEGER as total_time_spent,
        AVG(motivation_after - motivation_before)::NUMERIC as avg_motivation_increase,
        COUNT(CASE WHEN obstacles_encountered != '[]'::jsonb THEN 1 END)::BIGINT as obstacles_encountered,
        COUNT(CASE WHEN breakthrough_moments IS NOT NULL AND breakthrough_moments != '' THEN 1 END)::BIGINT as breakthroughs
    FROM micro_tasks 
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND status = 'completed'
    AND DATE(completion_date) = p_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get weekly productivity trends
CREATE OR REPLACE FUNCTION get_weekly_productivity_trends(p_project_id UUID DEFAULT NULL, p_weeks_back INTEGER DEFAULT 4)
RETURNS TABLE(
    week_start DATE,
    week_end DATE,
    tasks_completed BIGINT,
    total_time_spent INTEGER,
    avg_motivation_increase NUMERIC,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('week', completion_date)::DATE as week_start,
        (DATE_TRUNC('week', completion_date) + INTERVAL '6 days')::DATE as week_end,
        COUNT(*)::BIGINT as tasks_completed,
        COALESCE(SUM(actual_time_minutes), 0)::INTEGER as total_time_spent,
        AVG(motivation_after - motivation_before)::NUMERIC as avg_motivation_increase,
        ROUND(
            (COUNT(*)::NUMERIC / 
             (SELECT COUNT(*) FROM micro_tasks 
              WHERE (p_project_id IS NULL OR project_id = p_project_id)
              AND DATE_TRUNC('week', created_at) = DATE_TRUNC('week', mt.completion_date))) * 100, 2
        ) as completion_rate
    FROM micro_tasks mt
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND status = 'completed'
    AND completion_date >= NOW() - INTERVAL '1 week' * p_weeks_back
    GROUP BY DATE_TRUNC('week', completion_date)
    ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get obstacle analysis
CREATE OR REPLACE FUNCTION get_obstacle_analysis(p_project_id UUID DEFAULT NULL, p_days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    obstacle_type TEXT,
    frequency BIGINT,
    avg_frustration_level NUMERIC,
    common_solutions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'High Frustration'::TEXT as obstacle_type,
        COUNT(*)::BIGINT as frequency,
        AVG(
            (obstacles_encountered->0->>'frustrationLevel')::INTEGER
        )::NUMERIC as avg_frustration_level,
        ARRAY['90-second reset protocol', 'Take a short walk', 'Deep breathing exercise']::TEXT[] as common_solutions
    FROM micro_tasks 
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND status = 'completed'
    AND completion_date >= NOW() - INTERVAL '1 day' * p_days_back
    AND obstacles_encountered != '[]'::jsonb
    AND (obstacles_encountered->0->>'frustrationLevel')::INTEGER >= 8
    
    UNION ALL
    
    SELECT 
        'Overwhelm'::TEXT as obstacle_type,
        COUNT(*)::BIGINT as frequency,
        AVG(
            (obstacles_encountered->0->>'frustrationLevel')::INTEGER
        )::NUMERIC as avg_frustration_level,
        ARRAY['Break into smaller steps', 'Focus on one task', 'Set time limits']::TEXT[] as common_solutions
    FROM micro_tasks 
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND status = 'completed'
    AND completion_date >= NOW() - INTERVAL '1 day' * p_days_back
    AND obstacles_encountered != '[]'::jsonb
    AND obstacles_encountered->0->>'emotionalState' = 'overwhelmed'
    
    UNION ALL
    
    SELECT 
        'Boredom'::TEXT as obstacle_type,
        COUNT(*)::BIGINT as frequency,
        AVG(
            (obstacles_encountered->0->>'frustrationLevel')::INTEGER
        )::NUMERIC as avg_frustration_level,
        ARRAY['Add time challenge', 'Change environment', 'Break monotony']::TEXT[] as common_solutions
    FROM micro_tasks 
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
    AND status = 'completed'
    AND completion_date >= NOW() - INTERVAL '1 day' * p_days_back
    AND obstacles_encountered != '[]'::jsonb
    AND obstacles_encountered->0->>'emotionalState' = 'bored';
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy task completion tracking with correct column names
CREATE OR REPLACE VIEW task_completion_summary AS
SELECT 
    mt.id,
    mt.title,
    mt.project_id,
    p.title as project_name,
    mt.status,
    mt.priority,
    mt.estimated_time,
    mt.actual_time_minutes,
    mt.completion_date,
    mt.motivation_before,
    mt.motivation_after,
    mt.dopamine_rating,
    mt.next_task_motivation,
    mt.breakthrough_moments,
    mt.obstacles_encountered,
    CASE 
        WHEN mt.status = 'completed' AND mt.actual_time_minutes IS NOT NULL 
        THEN mt.actual_time_minutes - COALESCE(mt.estimated_time, 0)
        ELSE NULL 
    END as time_difference_minutes,
    CASE 
        WHEN mt.motivation_after IS NOT NULL AND mt.motivation_before IS NOT NULL
        THEN mt.motivation_after - mt.motivation_before
        ELSE NULL 
    END as motivation_change
FROM micro_tasks mt
LEFT JOIN projects p ON mt.project_id = p.id
ORDER BY mt.completion_date DESC NULLS LAST, mt.created_at DESC;

-- Grant permissions for all functions
GRANT EXECUTE ON FUNCTION get_next_recommended_task(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_task_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_productivity_summary(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_productivity_trends(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_obstacle_analysis(UUID, INTEGER) TO authenticated;

-- Grant select permission on the view
GRANT SELECT ON task_completion_summary TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_next_recommended_task(UUID) IS 'Gets the next recommended task based on priority and creation date';
COMMENT ON FUNCTION get_project_task_stats(UUID) IS 'Gets comprehensive task statistics for a project';
COMMENT ON FUNCTION get_daily_productivity_summary(UUID, DATE) IS 'Gets daily productivity summary with detailed metrics';
COMMENT ON FUNCTION get_weekly_productivity_trends(UUID, INTEGER) IS 'Gets weekly productivity trends and patterns';
COMMENT ON FUNCTION get_obstacle_analysis(UUID, INTEGER) IS 'Analyzes obstacles and provides common solutions';
COMMENT ON VIEW task_completion_summary IS 'Comprehensive view of all tasks with completion tracking data';

-- Verify the functions were created successfully
SELECT 
    routine_name, 
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'get_next_recommended_task',
    'get_project_task_stats',
    'get_daily_productivity_summary',
    'get_weekly_productivity_trends',
    'get_obstacle_analysis'
)
ORDER BY routine_name;

-- Verify the view was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'task_completion_summary';
