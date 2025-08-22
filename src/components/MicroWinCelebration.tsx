import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Star, PartyPopper, CheckCircle2, Brain } from 'lucide-react';

interface MicroWinCelebrationProps {
  isVisible: boolean;
  taskTitle: string;
  onClose: () => void;
}

const MicroWinCelebration: React.FC<MicroWinCelebrationProps> = ({
  isVisible,
  taskTitle,
  onClose
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      setStep(0);
      
      // Auto-advance through celebration steps
      const timer = setTimeout(() => setStep(1), 1000);
      const timer2 = setTimeout(() => setStep(2), 3000);
      const timer3 = setTimeout(() => setStep(3), 5000);
      const timer4 = setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, 8000);

      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const celebrationSteps = [
    {
      icon: <Trophy className="w-16 h-16 text-yellow-400" />,
      title: "🎉 Micro-Win Achieved!",
      message: "You just completed a focused 25-minute session!",
      color: "text-yellow-400"
    },
    {
      icon: <Brain className="w-16 h-16 text-purple-400" />,
      title: "🧠 Dopamine Released!",
      message: "Your brain is now associating work with reward",
      color: "text-purple-400"
    },
    {
      icon: <Zap className="w-16 h-16 text-blue-400" />,
      title: "⚡ Momentum Building!",
      message: "Each session strengthens your discipline neural pathways",
      color: "text-blue-400"
    },
    {
      icon: <CheckCircle2 className="w-16 h-16 text-green-400" />,
      title: "✅ Task Completed!",
      message: `"${taskTitle}" is now done!`,
      color: "text-green-400"
    }
  ];

  const currentStep = celebrationSteps[step] || celebrationSteps[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <div className={`w-2 h-2 rounded-full ${
                ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400'][Math.floor(Math.random() * 5)]
              }`}></div>
            </div>
          ))}
        </div>
      )}

      {/* Main Celebration Modal */}
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-gray-700/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
        >
          ✕
        </button>

        {/* Celebration Content */}
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            {currentStep.icon}
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold ${currentStep.color}`}>
            {currentStep.title}
          </h2>

          {/* Message */}
          <p className="text-gray-300 text-lg leading-relaxed">
            {currentStep.message}
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {celebrationSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= step ? 'bg-blue-400' : 'bg-gray-600'
                }`}
              ></div>
            ))}
          </div>

          {/* Celebration Actions */}
          <div className="space-y-3">
            <button
              onClick={() => {
                // Trigger physical celebration reminder
                setStep(3);
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              🎊 Celebrate Now!
            </button>
            
            <div className="text-sm text-gray-400">
              💡 Stand up, stretch, or do a fist pump for 30 seconds!
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 -left-2 w-4 h-4 bg-purple-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-green-400/20 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default MicroWinCelebration;
