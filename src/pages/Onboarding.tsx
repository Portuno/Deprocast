import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingFlow } from '../data/onboardingData';
import { OnboardingSlide, OnboardingFormData } from '../types/onboarding';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';

const Onboarding: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [collectedData, setCollectedData] = useState<OnboardingFormData>({});
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [isActivatingPersona, setIsActivatingPersona] = useState(false);
  
  // Field values state - moved to component level
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [tagValues, setTagValues] = useState<Record<string, string[]>>({});
  
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { completeOnboarding } = useOnboarding();

  const currentSlide = onboardingFlow.onboardingFlow[currentSlideIndex];
  const isLastSlide = currentSlideIndex === onboardingFlow.onboardingFlow.length - 1;

  // Redirect if user is not authenticated
  useEffect(() => {
    console.log('🎯 Onboarding: useEffect for auth check', { user: user?.email, currentPath: window.location.pathname, authLoading });
    
    // Don't redirect immediately if auth is still loading
    if (authLoading) {
      console.log('🎯 Onboarding: Auth still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('🎯 Onboarding: No user, redirecting to login');
      // Add a small delay to allow state to sync
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 100);
    } else {
      console.log('🎯 Onboarding: User authenticated, staying on onboarding');
    }
  }, [user, navigate, authLoading]);

  // Prevent going back to /app while onboarding is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentSlideIndex > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentSlideIndex]);

  // Clear field values when changing slides (optional - remove if you want to persist data)
  useEffect(() => {
    // Uncomment the next line if you want to clear fields between slides
    // setFieldValues({});
    // setTagValues({});
  }, [currentSlideIndex]);

  const handleNext = () => {
    if (isLastSlide) {
      return; // Don't auto-complete on last slide
    } else {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handleGenerateTasks = async () => {
    setIsGeneratingTasks(true);
    // Simulate AI task generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGeneratingTasks(false);
    handleNext();
  };

  const handleActivatePersona = async () => {
    setIsActivatingPersona(true);
    console.log('🎯 Starting persona activation...');
    
    // Simulate 12-second loading
    await new Promise(resolve => setTimeout(resolve, 12000));
    setIsActivatingPersona(false);
    
    console.log('✅ Persona activation complete, completing onboarding...');
    // Complete onboarding with collected data
    await completeOnboarding(collectedData);
    
    console.log('🚀 Onboarding complete, navigating to dashboard...');
    navigate('/dashboard', { replace: true });
  };

  const handleFormSubmit = (data: OnboardingFormData) => {
    setCollectedData(prev => ({ ...prev, ...data }));
    handleNext();
  };

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
    setCollectedData(prev => ({ ...prev, [key]: value }));
  };

  const handleTagsChange = (key: string, newTags: string[]) => {
    setTagValues(prev => ({ ...prev, [key]: newTags }));
    setCollectedData(prev => ({ ...prev, [key]: newTags }));
  };

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const canGoBack = currentSlideIndex > 0;

  const renderForm = () => {
    if (Object.keys(currentSlide.dataCollection).length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        {Object.entries(currentSlide.dataCollection).map(([key, type]) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            {renderField(key, type)}
          </div>
        ))}
      </div>
    );
  };

  const renderField = (key: string, type: 'select' | 'text' | 'number' | 'date' | 'tags') => {
    const fieldValue = fieldValues[key] || '';
    const tags = tagValues[key] || [];

    switch (type) {
      case 'select':
        return (
          <select
            value={fieldValue}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          >
            <option value="">Select an option...</option>
            {key === 'energyLevel' && (
              <>
                <option value="morning">I'm most energetic in the morning</option>
                <option value="afternoon">I hit my stride in the afternoon</option>
                <option value="evening">I'm a night owl</option>
                <option value="variable">My energy varies throughout the day</option>
              </>
            )}
            {key === 'distractionSusceptibility' && (
              <>
                <option value="low">I rarely get distracted</option>
                <option value="medium">I get distracted sometimes</option>
                <option value="high">I get distracted easily</option>
                <option value="very-high">I struggle to stay focused</option>
              </>
            )}
            {key === 'imposterSyndrome' && (
              <>
                <option value="never">I rarely feel like an imposter</option>
                <option value="sometimes">I sometimes doubt my abilities</option>
                <option value="often">I often feel like I don't belong</option>
                <option value="always">I constantly feel like an imposter</option>
              </>
            )}
            {key === 'projectType' && (
              <>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
                <option value="design">Design</option>
                <option value="writing">Writing</option>
                <option value="business">Business</option>
                <option value="learning">Learning</option>
                <option value="health">Health & Fitness</option>
                <option value="other">Other</option>
              </>
            )}
          </select>
        );
      
      case 'text':
        if (key === 'projectTitle') {
          return (
            <input
              type="text"
              value={fieldValue}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              placeholder="e.g., Web Development, Marketing Campaign"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          );
        }
        if (key === 'projectDescription') {
          return (
            <textarea
              value={fieldValue}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              placeholder="Describe what you want to achieve in as much detail as possible..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px] resize-none"
              required
            />
          );
        }
        if (key === 'motivation') {
          return (
            <textarea
              value={fieldValue}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              placeholder="Why do you want to complete this project?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px] resize-none"
              required
            />
          );
        }
        return (
          <textarea
            value={fieldValue}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            placeholder="Enter your response..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px] resize-none"
            required
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={fieldValue}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        );
      
      case 'number':
        if (key === 'perceivedDifficulty') {
          return (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>1 (Easy)</span>
                <span>10 (Very Hard)</span>
              </div>
                             <input
                 type="range"
                 min="1"
                 max="10"
                 value={fieldValue || 5}
                 onChange={(e) => handleFieldChange(key, e.target.value)}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                 required
               />
              <div className="text-center text-lg font-semibold text-purple-600">
                {fieldValue || 5}
              </div>
            </div>
          );
        }
        return (
          <input
            type="number"
            value={fieldValue}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        );
      
      case 'tags':
        return (
          <div className="space-y-3">
            <input
              type="text"
              placeholder={key === 'knownObstacles' ? 'e.g., Lack of time, Fear of failure' : 'e.g., Learn Python, Hire a designer'}
              onKeyDown={(e) => {
                                 if (e.key === 'Enter' || e.key === ',') {
                   e.preventDefault();
                   const value = e.currentTarget.value.trim();
                   if (value) {
                     handleTagsChange(key, [...tags, value]);
                     e.currentTarget.value = '';
                   }
                 }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                                     <button
                     type="button"
                     onClick={() => handleTagsChange(key, tags.filter((_, i) => i !== index))}
                     className="text-purple-600 hover:text-purple-800"
                   >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500">Press Enter or comma to add tags</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    if (Object.keys(currentSlide.dataCollection).length > 0) {
      return (
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {currentSlide.callToAction}
        </button>
      );
    }

    if (currentSlide.type === 'taskCreation' && currentSlide.slideNumber === 9) {
      return (
        <button
          onClick={handleGenerateTasks}
          disabled={isGeneratingTasks}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingTasks ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating Micro-Tasks...</span>
            </div>
          ) : (
            currentSlide.callToAction
          )}
        </button>
      );
    }

    if (currentSlide.type === 'summary' && currentSlide.slideNumber === 15) {
      return (
        <button
          onClick={handleActivatePersona}
          disabled={isActivatingPersona}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isActivatingPersona ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Activating User Persona...</span>
            </div>
          ) : (
            currentSlide.callToAction
          )}
        </button>
      );
    }

    return (
      <button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        {currentSlide.callToAction}
      </button>
    );
  };

  const renderVisual = () => {
    switch (currentSlide.type) {
      case 'welcome':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">🚀</span>
          </div>
        );
      case 'information':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">🧠</span>
          </div>
        );
      case 'dataCollection':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">📝</span>
          </div>
        );
      case 'taskCreation':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">⚡</span>
          </div>
        );
      case 'mindset':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">🌱</span>
          </div>
        );
      case 'summary':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">🎯</span>
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">✨</span>
          </div>
        );
    }
  };

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4 text-gray-700">Setting up your onboarding...</h1>
          <p className="text-gray-500">Please wait...</p>
          <p className="text-sm text-gray-400 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🎯 Onboarding: No user, showing loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4 text-gray-700">Redirecting...</h1>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Onboarding page rendered, current slide:', currentSlideIndex + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="bg-gray-100 h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentSlideIndex + 1) / onboardingFlow.onboardingFlow.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="pt-16 pb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center relative">
        {canGoBack && (
          <button
            onClick={handleBack}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-200 transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Go back to previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{currentSlide.title}</h1>
        <p className="text-purple-100 text-sm">
          Step {currentSlide.slideNumber} of {onboardingFlow.onboardingFlow.length}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Visual */}
        <div className="mb-8">
          {renderVisual()}
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-gray-700 text-lg leading-relaxed">
            {currentSlide.description}
          </p>
        </div>

        {/* Form or Content */}
        <div className="mb-8">
          {renderForm()}
        </div>

        {/* Action Button */}
        <div className="mb-8">
          {renderActionButton()}
        </div>

        {/* Slide Navigation */}
        <div className="flex justify-center space-x-3">
          {onboardingFlow.onboardingFlow.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlideIndex
                  ? 'bg-purple-500'
                  : index < currentSlideIndex
                  ? 'bg-green-400'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
