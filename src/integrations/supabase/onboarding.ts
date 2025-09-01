import { supabase } from './client';
import { OnboardingFormData } from '../../types/onboarding';

export interface OnboardingDataRecord {
  id: string;
  user_id: string;
  energy_level: string | null;
  distraction_susceptibility: string | null;
  imposter_syndrome: string | null;
  main_project: string | null;
  created_at: string;
  updated_at: string;
}

export const saveOnboardingData = async (data: OnboardingFormData): Promise<OnboardingDataRecord | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase.rpc('upsert_onboarding_data', {
      p_user_id: user.id,
      p_energy_level: data.energyLevel || null,
      p_distraction_susceptibility: data.distractionSusceptibility || null,
      p_imposter_syndrome: data.imposterSyndrome || null,
      p_main_project: data.mainProject || null,
    });

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    throw error;
  }
};

export const getOnboardingData = async (): Promise<OnboardingDataRecord | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('onboarding_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  } catch (error) {
    console.error('Error getting onboarding data:', error);
    throw error;
  }
};
