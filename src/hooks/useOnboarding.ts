import { useState, useEffect, useCallback, useRef } from 'react';
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
  const hasCheckedOnboarding = useRef(false);
  const lastCheckedUser = useRef<string | null>(null);

  const checkOnboardingStatus = useCallback(async () => {
    // Prevent multiple calls for the same user
    const currentUserEmail = user?.email || null;
    if (hasCheckedOnboarding.current && lastCheckedUser.current === currentUserEmail) {
      return;
    }

    if (!isAuthenticated || !user) {
      setIsLoading(false);
      setIsOnboardingRequired(null);
      hasCheckedOnboarding.current = false;
      lastCheckedUser.current = null;
      return;
    }

    try {
      setIsLoading(true);
      const userProfile = await getOrCreateProfile();
      
      if (userProfile) {
        setProfile(userProfile);
        const requiresOnboarding = !userProfile.onboarding_completed;
        setIsOnboardingRequired(requiresOnboarding);
        // Only log when status changes
        if (requiresOnboarding !== isOnboardingRequired) {
          console.log('🔍 useOnboarding: Onboarding status:', requiresOnboarding ? 'Required' : 'Completed');
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to requiring onboarding if there's an error
      setIsOnboardingRequired(true);
    } finally {
      setIsLoading(false);
      hasCheckedOnboarding.current = true;
      lastCheckedUser.current = currentUserEmail;
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

  // Reset onboarding check when user changes
  useEffect(() => {
    const currentUserEmail = user?.email || null;
    if (lastCheckedUser.current !== currentUserEmail) {
      hasCheckedOnboarding.current = false;
    }
  }, [user?.email]);

  return {
    isOnboardingRequired,
    isLoading,
    profile,
    completeOnboarding,
    checkOnboardingStatus,
  };
};
