-- Update projects table to support enhanced onboarding data
-- This adds fields needed for the new onboarding flow

-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS target_completion_date DATE,
ADD COLUMN IF NOT EXISTS project_type TEXT,
ADD COLUMN IF NOT EXISTS perceived_difficulty INTEGER CHECK (perceived_difficulty >= 1 AND perceived_difficulty <= 10),
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS known_obstacles TEXT[],
ADD COLUMN IF NOT EXISTS skills_needed TEXT[];

-- Update existing projects to have default values
UPDATE public.projects 
SET 
  target_completion_date = COALESCE(target_completion_date, (CURRENT_DATE + INTERVAL '30 days')::DATE),
  project_type = COALESCE(project_type, 'other'),
  perceived_difficulty = COALESCE(perceived_difficulty, 5),
  motivation = COALESCE(motivation, 'Project created during onboarding'),
  known_obstacles = COALESCE(known_obstacles, ARRAY['Time management', 'Focus']),
  skills_needed = COALESCE(skills_needed, ARRAY['Planning', 'Execution'])
WHERE target_completion_date IS NULL 
   OR project_type IS NULL 
   OR perceived_difficulty IS NULL 
   OR motivation IS NULL 
   OR known_obstacles IS NULL 
   OR skills_needed IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS projects_type_idx ON public.projects(project_type);
CREATE INDEX IF NOT EXISTS projects_difficulty_idx ON public.projects(perceived_difficulty);
CREATE INDEX IF NOT EXISTS projects_completion_date_idx ON public.projects(target_completion_date);

-- Verify the structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND column_name IN ('target_completion_date', 'project_type', 'perceived_difficulty', 'motivation', 'known_obstacles', 'skills_needed')
ORDER BY column_name;
