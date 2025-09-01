import React, { useState } from 'react';
import { onboardingFlow } from '../data/onboardingData';
import { OnboardingSlide, OnboardingFormData } from '../types/onboarding';
import OnboardingForm from './OnboardingForm';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [collectedData, setCollectedData] = useState<OnboardingFormData>({});

  const currentSlide = onboardingFlow.onboardingFlow[currentSlideIndex];
  const isLastSlide = currentSlideIndex === onboardingFlow.onboardingFlow.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlideIndex(prev => prev + 1);
    }
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

  const renderSlideContent = (slide: OnboardingSlide) => {
    if (Object.keys(slide.dataCollection).length > 0) {
      return <OnboardingForm slide={slide} onSubmit={handleFormSubmit} />;
    }

    return (
      <button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        {slide.callToAction}
      </button>
    );
  };

  const renderVisual = (slide: OnboardingSlide) => {
    // Simple visual representations based on slide type
    switch (slide.type) {
      case 'welcome':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">🚀</span>
          </div>
        );
      case 'information':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">🧠</span>
          </div>
        );
      case 'dataCollection':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">📝</span>
          </div>
        );
      case 'taskCreation':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">⚡</span>
          </div>
        );
      case 'mindset':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">🌱</span>
          </div>
        );
      case 'summary':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">🎯</span>
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">✨</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Progress Bar */}
        <div className="bg-gray-100 h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentSlideIndex + 1) / onboardingFlow.onboardingFlow.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center relative">
          {currentSlideIndex > 0 && (
            <button
              onClick={handleBack}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <h1 className="text-2xl font-bold mb-2">{currentSlide.title}</h1>
          <p className="text-purple-100 text-sm">
            Step {currentSlide.slideNumber} of {onboardingFlow.onboardingFlow.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Visual */}
          {renderVisual(currentSlide)}

          {/* Description */}
          <div className="text-center mb-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              {currentSlide.description}
            </p>
          </div>

          {/* Interactive Content */}
          <div className="space-y-4">
            {renderSlideContent(currentSlide)}
          </div>

          {/* Slide Navigation */}
          <div className="flex justify-center mt-8 space-x-2">
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
    </div>
  );
};

export default OnboardingFlow;
