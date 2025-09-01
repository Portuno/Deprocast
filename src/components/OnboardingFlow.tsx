import React, { useState } from 'react';
import { onboardingFlow } from '../data/onboardingData';
import { OnboardingSlide, OnboardingFormData, ProjectData } from '../types/onboarding';
import OnboardingForm from './OnboardingForm';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [collectedData, setCollectedData] = useState<OnboardingFormData>({});
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [isActivatingPersona, setIsActivatingPersona] = useState(false);

  const currentSlide = onboardingFlow.onboardingFlow[currentSlideIndex];
  const isLastSlide = currentSlideIndex === onboardingFlow.onboardingFlow.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      // Don't auto-complete on last slide, let the user click the button
      return;
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
    // Simulate 12-second loading
    await new Promise(resolve => setTimeout(resolve, 12000));
    setIsActivatingPersona(false);
    // Pass all collected data to complete onboarding
    onComplete(collectedData);
  };

  const handleFormSubmit = (data: OnboardingFormData) => {
    setCollectedData(prev => ({ ...prev, ...data }));
    handleNext();
  };

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const canGoBack = currentSlideIndex > 0;

  const renderSlideContent = (slide: OnboardingSlide) => {
    if (Object.keys(slide.dataCollection).length > 0) {
      return <OnboardingForm slide={slide} onSubmit={handleFormSubmit} />;
    }

    if (slide.type === 'taskCreation' && slide.slideNumber === 9) {
      return (
        <div className="w-full flex flex-col justify-end flex-1">
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
              slide.callToAction
            )}
          </button>
        </div>
      );
    }

    if (slide.type === 'summary' && slide.slideNumber === 15) {
      return (
        <div className="w-full flex flex-col justify-end flex-1">
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
              slide.callToAction
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col justify-end flex-1">
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {slide.callToAction}
        </button>
      </div>
    );
  };

  const renderVisual = (slide: OnboardingSlide) => {
    // Smaller visual representations to save space
    switch (slide.type) {
      case 'welcome':
        return (
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-xl md:text-2xl">🚀</span>
          </div>
        );
      case 'information':
        return (
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-xl md:text-2xl">🧠</span>
          </div>
        );
      case 'dataCollection':
        return (
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-xl md:text-2xl">📝</span>
          </div>
        );
      case 'taskCreation':
        return (
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-xl md:text-2xl">⚡</span>
          </div>
        );
      case 'mindset':
        return (
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-red-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-xl md:text-2xl">🌱</span>
          </div>
        );
      case 'summary':
        return (
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-xl md:text-2xl">🎯</span>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-xl md:text-2xl">✨</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 h-[550px] md:h-[600px] overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gray-100 h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentSlideIndex + 1) / onboardingFlow.onboardingFlow.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 md:p-4 text-white text-center relative">
          {canGoBack && (
            <button
              onClick={handleBack}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-200 transition-colors p-1.5 rounded-full hover:bg-white/10"
              aria-label="Go back to previous slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <h1 className="text-lg md:text-xl font-bold mb-1">{currentSlide.title}</h1>
          <p className="text-purple-100 text-xs">
            Step {currentSlide.slideNumber} of {onboardingFlow.onboardingFlow.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 flex flex-col h-full">
          {/* Visual - Reduced size and margin */}
          <div className="flex-shrink-0 mb-2">
            {renderVisual(currentSlide)}
          </div>

          {/* Description - Reduced margin and optimized text size */}
          <div className="text-center mb-3 flex-shrink-0">
            <p className="text-gray-700 text-sm md:text-base leading-relaxed px-2">
              {currentSlide.description}
            </p>
          </div>

          {/* Interactive Content - This will push the button to the bottom */}
          <div className="flex-1 flex flex-col">
            {renderSlideContent(currentSlide)}
          </div>

          {/* Slide Navigation - Reduced margin */}
          <div className="flex justify-center mt-2 space-x-2 flex-shrink-0">
            {onboardingFlow.onboardingFlow.map((_, index) => (
              <div
                key={index}
                className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-colors ${
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
    </div>
  );
};

export default OnboardingFlow;
