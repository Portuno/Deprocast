-- Add onboarding_completed field to profiles table if it doesn't exist
-- This ensures compatibility with existing installations

DO $$ 
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'onboarding_completed'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE public.profiles 
        ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;
        
        RAISE NOTICE 'Added onboarding_completed column to profiles table';
    ELSE
        RAISE NOTICE 'onboarding_completed column already exists in profiles table';
    END IF;
END $$;

-- Update existing profiles to have onboarding_completed = false
-- This ensures all existing users will go through onboarding
UPDATE public.profiles 
SET onboarding_completed = false 
WHERE onboarding_completed IS NULL;

-- Verify the structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'onboarding_completed';
