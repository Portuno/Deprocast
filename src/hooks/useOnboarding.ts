import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateProfile, updateProfile } from '../integrations/supabase/profiles';
import { OnboardingFormData } from '../types/onboarding';
import { saveOnboardingData } from '../integrations/supabase/onboarding';
import { processOnboardingData } from '../services/onboardingService';

export const useOnboarding = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOnboardingRequired, setIsOnboardingRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const checkOnboardingStatus = useCallback(async () => {
    console.log('🔍 useOnboarding: checkOnboardingStatus called', { isAuthenticated, user: user?.email });
    
    if (!isAuthenticated || !user) {
      console.log('🔍 useOnboarding: No auth or user, setting loading false');
      setIsLoading(false);
      setIsOnboardingRequired(null);
      return;
    }

    try {
      console.log('🔍 useOnboarding: Starting profile check...');
      setIsLoading(true);
      const userProfile = await getOrCreateProfile();
      
      if (userProfile) {
        setProfile(userProfile);
        const requiresOnboarding = !userProfile.onboarding_completed;
        setIsOnboardingRequired(requiresOnboarding);
        console.log('🔍 useOnboarding: Profile loaded, onboarding status:', requiresOnboarding ? 'Required' : 'Completed');
      } else {
        console.log('🔍 useOnboarding: No profile returned');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to requiring onboarding if there's an error
      setIsOnboardingRequired(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  const completeOnboarding = async (data?: OnboardingFormData) => {
    try {
      if (profile) {
        // Store onboarding data in database
        if (data) {
          await saveOnboardingData(data);
          
          // Process onboarding data to create project, tasks, and journal entry
          await processOnboardingData(data);
        }
        
        await updateProfile({ onboarding_completed: true });
        setProfile(prev => ({ ...prev, onboarding_completed: true }));
        setIsOnboardingRequired(false);
        console.log('✅ Onboarding completed successfully');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  return {
    isOnboardingRequired,
    isLoading,
    profile,
    completeOnboarding,
    checkOnboardingStatus,
  };
};
