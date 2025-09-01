import React from 'react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Deprocast!</h1>
          <p className="text-purple-100">Let's get you started on your productivity journey</p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">🚀</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Onboarding</h2>
            <p className="text-gray-600">
              This is your first step towards overcoming procrastination and achieving your goals.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
