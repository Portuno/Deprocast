-- Create table for task obstacles/blocks
CREATE TABLE IF NOT EXISTS task_obstacles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES micro_tasks(id) ON DELETE CASCADE,
    
    -- Obstacle details
    description TEXT NOT NULL,
    emotional_state TEXT NOT NULL,
    frustration_level INTEGER CHECK (frustration_level >= 1 AND frustration_level <= 10),
    
    -- Context information
    time_spent_minutes INTEGER NOT NULL DEFAULT 0, -- Time spent on task before hitting obstacle
    time_remaining_seconds INTEGER NOT NULL DEFAULT 0, -- Time remaining in pomodoro when obstacle was reported
    
    -- AI solution (optional, for when it gets implemented)
    ai_solution TEXT,
    ai_solution_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_obstacles_user_id ON task_obstacles(user_id);
CREATE INDEX IF NOT EXISTS idx_task_obstacles_project_id ON task_obstacles(project_id);
CREATE INDEX IF NOT EXISTS idx_task_obstacles_task_id ON task_obstacles(task_id);
CREATE INDEX IF NOT EXISTS idx_task_obstacles_created_at ON task_obstacles(created_at);

-- Enable RLS
ALTER TABLE task_obstacles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own task obstacles"
    ON task_obstacles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task obstacles"
    ON task_obstacles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task obstacles"
    ON task_obstacles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task obstacles"
    ON task_obstacles FOR DELETE
    USING (auth.uid() = user_id);

-- Function to insert a new task obstacle
CREATE OR REPLACE FUNCTION insert_task_obstacle(
    p_project_id UUID,
    p_task_id UUID,
    p_description TEXT,
    p_emotional_state TEXT,
    p_frustration_level INTEGER,
    p_time_spent_minutes INTEGER DEFAULT 0,
    p_time_remaining_seconds INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    obstacle_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validate inputs
    IF p_description IS NULL OR trim(p_description) = '' THEN
        RAISE EXCEPTION 'Description cannot be empty';
    END IF;

    IF p_emotional_state IS NULL OR trim(p_emotional_state) = '' THEN
        RAISE EXCEPTION 'Emotional state cannot be empty';
    END IF;

    IF p_frustration_level < 1 OR p_frustration_level > 10 THEN
        RAISE EXCEPTION 'Frustration level must be between 1 and 10';
    END IF;

    -- Verify task belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM micro_tasks 
        WHERE id = p_task_id AND user_id = current_user_id
    ) THEN
        RAISE EXCEPTION 'Task not found or access denied';
    END IF;

    -- Insert obstacle
    INSERT INTO task_obstacles (
        user_id,
        project_id,
        task_id,
        description,
        emotional_state,
        frustration_level,
        time_spent_minutes,
        time_remaining_seconds
    ) VALUES (
        current_user_id,
        p_project_id,
        p_task_id,
        trim(p_description),
        p_emotional_state,
        p_frustration_level,
        p_time_spent_minutes,
        p_time_remaining_seconds
    ) RETURNING id INTO obstacle_id;

    RETURN obstacle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get obstacles for a task
CREATE OR REPLACE FUNCTION get_task_obstacles(p_task_id UUID)
RETURNS TABLE (
    id UUID,
    description TEXT,
    emotional_state TEXT,
    frustration_level INTEGER,
    time_spent_minutes INTEGER,
    time_remaining_seconds INTEGER,
    ai_solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Verify task belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM micro_tasks 
        WHERE micro_tasks.id = p_task_id AND user_id = current_user_id
    ) THEN
        RAISE EXCEPTION 'Task not found or access denied';
    END IF;

    RETURN QUERY
    SELECT 
        task_obstacles.id,
        task_obstacles.description,
        task_obstacles.emotional_state,
        task_obstacles.frustration_level,
        task_obstacles.time_spent_minutes,
        task_obstacles.time_remaining_seconds,
        task_obstacles.ai_solution,
        task_obstacles.created_at
    FROM task_obstacles
    WHERE task_obstacles.task_id = p_task_id 
      AND task_obstacles.user_id = current_user_id
    ORDER BY task_obstacles.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get obstacles for a project
CREATE OR REPLACE FUNCTION get_project_obstacles(p_project_id UUID)
RETURNS TABLE (
    id UUID,
    task_id UUID,
    task_title TEXT,
    description TEXT,
    emotional_state TEXT,
    frustration_level INTEGER,
    time_spent_minutes INTEGER,
    time_remaining_seconds INTEGER,
    ai_solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Verify project belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = p_project_id AND user_id = current_user_id
    ) THEN
        RAISE EXCEPTION 'Project not found or access denied';
    END IF;

    RETURN QUERY
    SELECT 
        task_obstacles.id,
        task_obstacles.task_id,
        micro_tasks.title as task_title,
        task_obstacles.description,
        task_obstacles.emotional_state,
        task_obstacles.frustration_level,
        task_obstacles.time_spent_minutes,
        task_obstacles.time_remaining_seconds,
        task_obstacles.ai_solution,
        task_obstacles.created_at
    FROM task_obstacles
    INNER JOIN micro_tasks ON task_obstacles.task_id = micro_tasks.id
    WHERE task_obstacles.project_id = p_project_id 
      AND task_obstacles.user_id = current_user_id
    ORDER BY task_obstacles.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update obstacle with AI solution
CREATE OR REPLACE FUNCTION update_obstacle_ai_solution(
    p_obstacle_id UUID,
    p_ai_solution TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Update obstacle with AI solution
    UPDATE task_obstacles 
    SET 
        ai_solution = p_ai_solution,
        ai_solution_generated_at = NOW(),
        updated_at = NOW()
    WHERE id = p_obstacle_id 
      AND user_id = current_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_task_obstacles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_obstacles_updated_at
    BEFORE UPDATE ON task_obstacles
    FOR EACH ROW
    EXECUTE FUNCTION update_task_obstacles_updated_at();
