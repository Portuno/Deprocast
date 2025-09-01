import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getOrCreateProfile, updateProfile } from '../integrations/supabase/profiles';
import { OnboardingFormData } from '../types/onboarding';
import { saveOnboardingData } from '../integrations/supabase/onboarding';
import { processOnboardingData } from '../services/onboardingService';

export const useOnboarding = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOnboardingRequired, setIsOnboardingRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingFormData>({});

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userProfile = await getOrCreateProfile();
        
        if (userProfile) {
          setProfile(userProfile);
          setIsOnboardingRequired(!userProfile.onboarding_completed);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to requiring onboarding if there's an error
        setIsOnboardingRequired(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, user]);

  const completeOnboarding = async (data?: OnboardingFormData) => {
    try {
      if (profile) {
        // Store onboarding data in database
        if (data) {
          setOnboardingData(data);
          await saveOnboardingData(data);
          
          // Process onboarding data to create project, tasks, and journal entry
          await processOnboardingData(data);
        }
        
        await updateProfile({ onboarding_completed: true });
        setProfile(prev => ({ ...prev, onboarding_completed: true }));
        setIsOnboardingRequired(false);
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
    onboardingData,
    completeOnboarding,
  };
};
