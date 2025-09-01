-- Helper functions for blueprint generation
-- This file contains any additional database functions that might be useful for generating user blueprints

-- Function to get user task completion statistics
CREATE OR REPLACE FUNCTION get_user_task_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_tasks', COUNT(*),
        'completed_tasks', COUNT(*) FILTER (WHERE status = 'completed'),
        'in_progress_tasks', COUNT(*) FILTER (WHERE status = 'in-progress'),
        'pending_tasks', COUNT(*) FILTER (WHERE status = 'pending'),
        'avg_dopamine_score', AVG(dopamine_score),
        'avg_estimated_minutes', AVG(estimated_minutes),
        'avg_actual_minutes', AVG(actual_minutes)
    ) INTO result
    FROM micro_tasks 
    WHERE user_id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user journal insights
CREATE OR REPLACE FUNCTION get_user_journal_insights(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_entries', COUNT(*),
        'avg_energy', AVG(energy),
        'avg_focus', AVG(focus),
        'mood_distribution', json_object_agg(mood, mood_count),
        'recent_entries_count', COUNT(*) FILTER (WHERE entry_date >= CURRENT_DATE - INTERVAL '30 days')
    ) INTO result
    FROM (
        SELECT 
            *,
            COUNT(*) OVER (PARTITION BY mood) as mood_count
        FROM journal_entries 
        WHERE user_id = p_user_id
    ) t;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user productivity patterns
CREATE OR REPLACE FUNCTION get_user_productivity_patterns(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- This could be expanded to analyze patterns by day of week, time of day, etc.
    SELECT json_build_object(
        'completion_rate', 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric) * 100, 2)
            ELSE 0 
        END,
        'average_task_duration', AVG(actual_minutes),
        'most_productive_task_type', 
        (SELECT task_type 
         FROM micro_tasks 
         WHERE user_id = p_user_id AND status = 'completed' AND task_type IS NOT NULL
         GROUP BY task_type 
         ORDER BY COUNT(*) DESC 
         LIMIT 1),
        'total_focus_time_hours', 
        ROUND(SUM(actual_minutes) / 60.0, 2)
    ) INTO result
    FROM micro_tasks 
    WHERE user_id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for these functions (they're already security definer, but good practice)
-- Note: These functions already check user_id internally, so they're secure

-- Add comments
COMMENT ON FUNCTION get_user_task_stats(UUID) IS 'Returns comprehensive task statistics for a user';
COMMENT ON FUNCTION get_user_journal_insights(UUID) IS 'Returns journal insights and patterns for a user';
COMMENT ON FUNCTION get_user_productivity_patterns(UUID) IS 'Returns productivity patterns and metrics for a user';
