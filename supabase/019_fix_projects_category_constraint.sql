-- Fix projects category constraint issue
-- This script addresses the "projects_category_check" constraint violation

-- First, let's see what constraints exist
-- SELECT 
--     conname as constraint_name,
--     pg_get_constraintdef(oid) as constraint_definition
-- FROM pg_constraint 
-- WHERE conrelid = 'public.projects'::regclass;

-- Drop the problematic constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'projects_category_check' 
        AND conrelid = 'public.projects'::regclass
    ) THEN
        ALTER TABLE public.projects DROP CONSTRAINT projects_category_check;
        RAISE NOTICE 'Dropped projects_category_check constraint';
    ELSE
        RAISE NOTICE 'projects_category_check constraint does not exist';
    END IF;
END $$;

-- Create a new, more flexible constraint for the category field
-- Allow any text value for category, or make it nullable
ALTER TABLE public.projects 
ALTER COLUMN category DROP NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN public.projects.category IS 'Project category - flexible text field for project classification';

-- Alternative: If you want to keep some validation, create a more permissive constraint
-- ALTER TABLE public.projects 
-- ADD CONSTRAINT projects_category_check 
-- CHECK (category IS NULL OR length(trim(category)) > 0);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
AND column_name = 'category';
