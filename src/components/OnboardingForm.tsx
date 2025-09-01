import React, { useState } from 'react';
import { OnboardingSlide, OnboardingFormData } from '../types/onboarding';

interface OnboardingFormProps {
  slide: OnboardingSlide;
  onSubmit: (data: OnboardingFormData) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ slide, onSubmit }) => {
  const [formData, setFormData] = useState<OnboardingFormData>({});

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (key: string, type: 'select' | 'text' | 'number') => {
    switch (type) {
      case 'select':
        return (
          <select
            key={key}
            value={formData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
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
          </select>
        );
      
      case 'text':
        return (
          <textarea
            key={key}
            value={formData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder="Describe your project..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px] resize-none"
            required
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(slide.dataCollection).map(([key, type]) => (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {renderField(key, type)}
        </div>
      ))}
      
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        {slide.callToAction}
      </button>
    </form>
  );
};

export default OnboardingForm;
