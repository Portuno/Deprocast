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

  const renderField = (key: string, type: 'select' | 'text' | 'number' | 'date' | 'tags') => {
    switch (type) {
      case 'select':
        return (
                                                        <select
                          key={key}
                          value={formData[key] || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                          key={key}
                          type="text"
                          value={formData[key] || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          placeholder="e.g., Web Development, Marketing Campaign"
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
          );
        }
        if (key === 'projectDescription') {
          return (
                                    <textarea
                          key={key}
                          value={formData[key] || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          placeholder="Describe what you want to achieve in as much detail as possible..."
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px] resize-none"
                          required
                        />
          );
        }
        if (key === 'motivation') {
          return (
                                    <textarea
                          key={key}
                          value={formData[key] || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          placeholder="Why do you want to complete this project?"
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[60px] resize-none"
                          required
                        />
          );
        }
        return (
          <textarea
            key={key}
            value={formData[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder="Enter your response..."
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[60px] resize-none"
            required
          />
        );
      
      case 'date':
        return (
                                  <input
                          key={key}
                          type="date"
                          value={formData[key] || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
        );
      
      case 'number':
        if (key === 'perceivedDifficulty') {
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>1 (Easy)</span>
                <span>10 (Very Hard)</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData[key] || 5}
                onChange={(e) => handleInputChange(key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                required
              />
              <div className="text-center text-base font-semibold text-purple-600">
                {formData[key] || 5}
              </div>
            </div>
          );
        }
        return (
                                  <input
                          key={key}
                          type="number"
                          value={formData[key] || ''}
                          onChange={(e) => handleInputChange(key, parseInt(e.target.value))}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
        );
      
      case 'tags':
        return (
          <div key={key} className="space-y-1.5">
            <input
              type="text"
              placeholder={key === 'knownObstacles' ? 'e.g., Lack of time, Fear of failure' : 'e.g., Learn Python, Hire a designer'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    const currentTags = (formData[key] as string[]) || [];
                    handleInputChange(key, [...currentTags, value]);
                    e.currentTarget.value = '';
                  }
                }
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-1.5">
              {(formData[key] as string[])?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const currentTags = (formData[key] as string[]) || [];
                      handleInputChange(key, currentTags.filter((_, i) => i !== index));
                    }}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">Press Enter or comma to add tags</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 h-full flex flex-col">
      <div className="flex-1 space-y-3">
        {Object.entries(slide.dataCollection).map(([key, type]) => (
          <div key={key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            {renderField(key, type)}
          </div>
        ))}
      </div>
      
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex-shrink-0"
      >
        {slide.callToAction}
      </button>
    </form>
  );
};

export default OnboardingForm;
