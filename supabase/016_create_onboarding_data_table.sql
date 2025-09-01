-- Create onboarding_data table to store user onboarding responses
CREATE TABLE IF NOT EXISTS public.onboarding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User preferences and patterns
    energy_level TEXT,
    distraction_susceptibility TEXT,
    imposter_syndrome TEXT,
    
    -- Main project information
    main_project TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT onboarding_data_user_unique UNIQUE (user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS onboarding_data_user_id_idx ON public.onboarding_data(user_id);

-- Enable RLS
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Onboarding data select own" ON public.onboarding_data;
CREATE POLICY "Onboarding data select own"
ON public.onboarding_data FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Onboarding data insert own" ON public.onboarding_data;
CREATE POLICY "Onboarding data insert own"
ON public.onboarding_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Onboarding data update own" ON public.onboarding_data;
CREATE POLICY "Onboarding data update own"
ON public.onboarding_data FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Onboarding data delete own" ON public.onboarding_data;
CREATE POLICY "Onboarding data delete own"
ON public.onboarding_data FOR DELETE
USING (auth.uid() = user_id);

-- Updated trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_onboarding_data_updated_at ON public.onboarding_data;
CREATE TRIGGER set_onboarding_data_updated_at
BEFORE UPDATE ON public.onboarding_data
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function to upsert onboarding data
CREATE OR REPLACE FUNCTION public.upsert_onboarding_data(
    p_user_id UUID,
    p_energy_level TEXT DEFAULT NULL,
    p_distraction_susceptibility TEXT DEFAULT NULL,
    p_imposter_syndrome TEXT DEFAULT NULL,
    p_main_project TEXT DEFAULT NULL
)
RETURNS public.onboarding_data AS $$
DECLARE
    result public.onboarding_data;
BEGIN
    INSERT INTO public.onboarding_data (
        user_id,
        energy_level,
        distraction_susceptibility,
        imposter_syndrome,
        main_project
    ) VALUES (
        p_user_id,
        p_energy_level,
        p_distraction_susceptibility,
        p_imposter_syndrome,
        p_main_project
    )
    ON CONFLICT (user_id) DO UPDATE SET
        energy_level = COALESCE(EXCLUDED.energy_level, onboarding_data.energy_level),
        distraction_susceptibility = COALESCE(EXCLUDED.distraction_susceptibility, onboarding_data.distraction_susceptibility),
        imposter_syndrome = COALESCE(EXCLUDED.imposter_syndrome, onboarding_data.imposter_syndrome),
        main_project = COALESCE(EXCLUDED.main_project, onboarding_data.main_project),
        updated_at = now()
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
