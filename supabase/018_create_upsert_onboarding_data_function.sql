-- Function to upsert onboarding data
-- This function allows inserting or updating onboarding data for a user

CREATE OR REPLACE FUNCTION public.upsert_onboarding_data(
    p_user_id UUID,
    p_energy_level TEXT,
    p_distraction_susceptibility TEXT,
    p_imposter_syndrome TEXT,
    p_main_project TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
    v_onboarding_id UUID;
BEGIN
    -- Check if onboarding data already exists for this user
    SELECT id INTO v_onboarding_id
    FROM public.onboarding_data
    WHERE user_id = p_user_id;
    
    IF v_onboarding_id IS NOT NULL THEN
        -- Update existing record
        UPDATE public.onboarding_data
        SET 
            energy_level = p_energy_level,
            distraction_susceptibility = p_distraction_susceptibility,
            imposter_syndrome = p_imposter_syndrome,
            main_project = p_main_project,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        v_result := json_build_object(
            'success', true,
            'action', 'updated',
            'id', v_onboarding_id,
            'message', 'Onboarding data updated successfully'
        );
    ELSE
        -- Insert new record
        INSERT INTO public.onboarding_data (
            user_id,
            energy_level,
            distraction_susceptibility,
            imposter_syndrome,
            main_project,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            p_energy_level,
            p_distraction_susceptibility,
            p_imposter_syndrome,
            p_main_project,
            NOW(),
            NOW()
        ) RETURNING id INTO v_onboarding_id;
        
        v_result := json_build_object(
            'success', true,
            'action', 'inserted',
            'id', v_onboarding_id,
            'message', 'Onboarding data created successfully'
        );
    END IF;
    
    -- Update the user's profile to mark onboarding as completed
    UPDATE public.profiles
    SET onboarding_completed = true
    WHERE id = p_user_id;
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        v_result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to upsert onboarding data'
        );
        RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_onboarding_data(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.upsert_onboarding_data IS 'Upsert onboarding data for a user and mark onboarding as completed';
