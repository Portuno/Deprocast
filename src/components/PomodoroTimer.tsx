import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, X, Brain, Target, AlertTriangle, Trophy, Zap, Clock, BarChart3 } from 'lucide-react';
import MicroWinCelebration from './MicroWinCelebration';

interface PomodoroTimerProps {
  isActive: boolean;
  onComplete: (data: TaskCompletionData) => void;
  onCancel: () => void;
  taskTitle: string;
  estimatedTimeMinutes?: number;
}

interface TaskCompletionData {
  taskTitle: string;
  estimatedTimeMinutes?: number;
  actualTimeMinutes: number;
  motivationBefore: number;
  motivationAfter: number;
  dopamineRating: number;
  nextTaskMotivation: number;
  breakthroughMoments: string;
  obstaclesEncountered: ObstacleData[];
  completionDate: string;
}

interface ObstacleData {
  description: string;
  emotionalState: string;
  frustrationLevel: number;
  timeRemaining: number;
  timestamp: string;
  aiSolution?: string;
}

interface ExecutionRule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ 
  isActive, 
  onComplete, 
  onCancel, 
  taskTitle,
  estimatedTimeMinutes
}) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'break' | 'longBreak'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showDopaminePrompt, setShowDopaminePrompt] = useState(true);
  const [showObstacleResolver, setShowObstacleResolver] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [obstacleInput, setObstacleInput] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [frustrationLevel, setFrustrationLevel] = useState<number>(5);
  const [motivationBefore, setMotivationBefore] = useState<number | null>(null);
  const [motivationAfter, setMotivationAfter] = useState<number | null>(null);
  const [dopamineRating, setDopamineRating] = useState<number | null>(null);
  const [nextTaskMotivation, setNextTaskMotivation] = useState<number | null>(null);
  const [breakthroughMoments, setBreakthroughMoments] = useState('');
  const [obstaclesEncountered, setObstaclesEncountered] = useState<ObstacleData[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [taskInitiationDelay, setTaskInitiationDelay] = useState<number>(0);

  const executionRules: ExecutionRule[] = [
    {
      id: 'no-research',
      title: 'No Research Rule',
      description: 'During this session, NO research is allowed. Add "Research X" as a separate micro-task if needed.',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      completed: false
    },
    {
      id: 'document-dopamine',
      title: 'Document Dopamine Spikes',
      description: 'Rate your motivation before and after the task to track dopamine patterns.',
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      completed: false
    },
    {
      id: 'celebrate-wins',
      title: 'Celebrate Micro-Wins',
      description: 'Stand up, stretch, or do a fist pump for 30 seconds upon completion.',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      completed: false
    },
    {
      id: 'stay-focused',
      title: 'Stay Focused',
      description: 'Work exclusively on this task with no distractions for the full 25 minutes.',
      icon: <Target className="w-5 h-5 text-blue-400" />,
      completed: false
    }
  ];

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }
    
    setIsRunning(true);
    setShowDopaminePrompt(false);
    
    // Mark dopamine priming as completed
    executionRules[1].completed = true;
    
    // Calculate task initiation delay
    if (sessionStartTime) {
      const delay = Math.round((Date.now() - sessionStartTime.getTime()) / 1000);
      setTaskInitiationDelay(delay);
    }
  }, [sessionStartTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(25 * 60);
    setIsRunning(false);
    setCurrentPhase('work');
    setShowDopaminePrompt(true);
    setSessionStartTime(null);
    setTaskInitiationDelay(0);
    
    // Reset all rules
    executionRules.forEach(rule => rule.completed = false);
  }, []);

  const completePomodoro = useCallback(() => {
    setCompletedPomodoros(prev => prev + 1);
    setShowObstacleResolver(false);
    
    // Show completion form instead of celebration
    setShowCompletionForm(true);
  }, []);

  const handleCompletionSubmit = useCallback(() => {
    if (!motivationBefore || !motivationAfter || !dopamineRating || !nextTaskMotivation) {
      return; // Don't submit if required fields are missing
    }

    const actualTimeMinutes = sessionStartTime 
      ? Math.round((Date.now() - sessionStartTime.getTime()) / 60000)
      : 25;

    const completionData: TaskCompletionData = {
      taskTitle,
      estimatedTimeMinutes,
      actualTimeMinutes,
      motivationBefore,
      motivationAfter,
      dopamineRating,
      nextTaskMotivation,
      breakthroughMoments,
      obstaclesEncountered,
      completionDate: new Date().toISOString()
    };

    onComplete(completionData);
  }, [
    taskTitle, 
    estimatedTimeMinutes, 
    motivationBefore, 
    motivationAfter, 
    dopamineRating, 
    nextTaskMotivation, 
    breakthroughMoments, 
    obstaclesEncountered, 
    sessionStartTime, 
    onComplete
  ]);

  const handleObstacleSubmit = useCallback(() => {
    if (obstacleInput.trim() && emotionalState.trim()) {
      const obstacleData: ObstacleData = {
        description: obstacleInput,
        emotionalState,
        frustrationLevel,
        timeRemaining: timeLeft,
        timestamp: new Date().toISOString(),
        aiSolution: getAISolution(obstacleInput, emotionalState, frustrationLevel, timeLeft)
      };

      setObstaclesEncountered(prev => [...prev, obstacleData]);
      setObstacleInput('');
      setEmotionalState('');
      setFrustrationLevel(5);
      setShowObstacleResolver(false);
    }
  }, [obstacleInput, emotionalState, frustrationLevel, timeLeft]);

  const getAISolution = (obstacle: string, emotion: string, frustration: number, timeLeft: number): string => {
    // AI-powered solutions based on neuroscience
    if (frustration >= 8) {
      return "High frustration detected! Try the 90-second reset protocol: Stand up, take 3 deep breaths, stretch for 30 seconds, then return to task.";
    }
    
    if (timeLeft < 300) { // Less than 5 minutes
      return "Session ending soon! Focus on completing one small, concrete step. This creates momentum for your next session.";
    }
    
    if (emotion === 'overwhelmed') {
      return "Overwhelm detected! Break this into 3 smaller steps. Complete just the first one - momentum will carry you forward.";
    }
    
    if (emotion === 'bored') {
      return "Boredom is resistance in disguise! Add a challenge: Can you complete this in 20 minutes instead of 25?";
    }
    
    return "Try the 5-minute circuit breaker: Set a timer for 5 minutes and work intensely. Often, resistance disappears once you start.";
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (currentPhase === 'work') {
              setCurrentPhase('break');
              setTimeLeft(5 * 60); // 5 minute dopamine celebration break
              setIsRunning(true);
            } else if (currentPhase === 'break') {
              if (completedPomodoros % 4 === 3) {
                setCurrentPhase('longBreak');
                setTimeLeft(15 * 60); // 15 minute long break
              } else {
                setCurrentPhase('work');
                setTimeLeft(25 * 60);
              }
              setIsRunning(false);
            } else {
              setCurrentPhase('work');
              setTimeLeft(25 * 60);
              setIsRunning(false);
            }
            return prev;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, currentPhase, completedPomodoros]);

  // Auto-start when component becomes active
  useEffect(() => {
    if (isActive && !isRunning) {
      setSessionStartTime(new Date());
    }
  }, [isActive, isRunning]);

  if (!isActive) return null;

  // Show completion form
  if (showCompletionForm) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">🎉 Session Complete!</h2>
            <p className="text-gray-400">Let's capture your productivity data for AI coaching insights</p>
          </div>

          <div className="space-y-6">
            {/* Pre-Task Baseline */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">📊 Pre-Task Baseline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Initial Motivation (1-10)</label>
                  <select
                    value={motivationBefore || ''}
                    onChange={(e) => setMotivationBefore(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Task Initiation Delay</label>
                  <div className="text-lg font-bold text-blue-400">
                    {taskInitiationDelay}s
                  </div>
                  <div className="text-xs text-gray-500">
                    Time from click to start
                  </div>
                </div>
              </div>
            </div>

            {/* Post-Task Metrics */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">📈 Post-Task Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Final Motivation (1-10)</label>
                  <select
                    value={motivationAfter || ''}
                    onChange={(e) => setMotivationAfter(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Dopamine Rating (1-10)</label>
                  <select
                    value={dopamineRating || ''}
                    onChange={(e) => setDopamineRating(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Next Task Motivation (1-10)</label>
                  <select
                    value={nextTaskMotivation || ''}
                    onChange={(e) => setNextTaskMotivation(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Time Performance</label>
                  <div className="text-lg font-bold text-green-400">
                    {sessionStartTime 
                      ? Math.round((Date.now() - sessionStartTime.getTime()) / 60000)
                      : 25} min
                  </div>
                  <div className="text-xs text-gray-500">
                    {estimatedTimeMinutes ? `vs ${estimatedTimeMinutes} min estimated` : 'Actual time'}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakthrough Moments */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">💡 Breakthrough Moments</h3>
              <label className="block text-sm text-gray-400 mb-2">
                Any insights or moments when resistance disappeared?
              </label>
              <textarea
                value={breakthroughMoments}
                onChange={(e) => setBreakthroughMoments(e.target.value)}
                placeholder="Describe any 'aha' moments, resistance breakthroughs, or insights..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
                rows={3}
              />
            </div>

            {/* Obstacles Summary */}
            {obstaclesEncountered.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">🚨 Obstacles Encountered</h3>
                <div className="space-y-2">
                  {obstaclesEncountered.map((obstacle, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-white font-medium">{obstacle.description}</span>
                        <span className="text-xs text-gray-400">Frustration: {obstacle.frustrationLevel}/10</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {obstacle.emotionalState} • {Math.floor(obstacle.timeRemaining / 60)}:{String(obstacle.timeRemaining % 60).padStart(2, '0')} remaining
                      </div>
                      {obstacle.aiSolution && (
                        <div className="text-xs text-orange-300 bg-orange-500/20 rounded p-2">
                          💡 AI Solution: {obstacle.aiSolution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCompletionSubmit}
                disabled={!motivationBefore || !motivationAfter || !dopamineRating || !nextTaskMotivation}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Submit & Complete
              </button>
              <button
                onClick={() => setShowCompletionForm(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <X className="w-5 h-5 inline mr-2" />
                Back to Timer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">🚀 Pomodoro+ Protocol</h2>
          <p className="text-gray-400">Neuroscience-backed focus session for: <span className="text-blue-400 font-medium">{taskTitle}</span></p>
          {estimatedTimeMinutes && (
            <div className="text-sm text-gray-500 mt-2">
              Estimated: {estimatedTimeMinutes} minutes
            </div>
          )}
        </div>

        {/* Dopamine Priming Prompt */}
        {showDopaminePrompt && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6 mb-6 text-center">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">🎯 Dopamine Priming</h3>
            <p className="text-gray-300 mb-4">
              Close your eyes for 10 seconds and visualize yourself completing this task successfully. 
              Feel the satisfaction and pride of accomplishment.
            </p>
            <button
              onClick={startTimer}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Let's Go!
            </button>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className={`text-6xl font-bold mb-2 ${
            currentPhase === 'work' ? 'text-blue-400' : 
            currentPhase === 'break' ? 'text-green-400' : 'text-purple-400'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-lg text-gray-400 mb-4">
            {currentPhase === 'work' ? 'Focus Session' : 
             currentPhase === 'break' ? 'Dopamine Celebration Break' : 'Long Break'}
          </div>
          
          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <Play className="w-5 h-5 inline mr-2" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <Pause className="w-5 h-5 inline mr-2" />
                Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Execution Rules */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">📋 Execution Rules</h3>
          <div className="space-y-3">
            {executionRules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  rule.completed 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-gray-800/30 border-gray-600/30'
                }`}
              >
                {rule.icon}
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    rule.completed ? 'text-green-400' : 'text-white'
                  }`}>
                    {rule.title}
                  </h4>
                  <p className={`text-sm ${
                    rule.completed ? 'text-green-300' : 'text-gray-400'
                  }`}>
                    {rule.description}
                  </p>
                </div>
                {rule.completed && (
                  <div className="text-green-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Obstacle Resolution */}
        <div className="mb-6">
          <button
            onClick={() => setShowObstacleResolver(!showObstacleResolver)}
            className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg p-4 text-left hover:from-orange-400/30 hover:to-red-400/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                <div>
                  <h4 className="font-medium text-white">🚨 Real-Time Obstacle Resolution</h4>
                  <p className="text-sm text-gray-400">Stuck? Get immediate AI-powered solutions</p>
                </div>
              </div>
              <div className={`transform transition-transform duration-200 ${
                showObstacleResolver ? 'rotate-180' : ''
              }`}>
                ▼
              </div>
            </div>
          </button>

          {showObstacleResolver && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">What's blocking you?</label>
                <textarea
                  value={obstacleInput}
                  onChange={(e) => setObstacleInput(e.target.value)}
                  placeholder="Describe the obstacle you're facing..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">How are you feeling?</label>
                  <select
                    value={emotionalState}
                    onChange={(e) => setEmotionalState(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select emotional state...</option>
                    <option value="frustrated">😤 Frustrated</option>
                    <option value="overwhelmed">😰 Overwhelmed</option>
                    <option value="bored">😐 Bored</option>
                    <option value="anxious">😰 Anxious</option>
                    <option value="confused">😕 Confused</option>
                    <option value="tired">😴 Tired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Frustration Level (1-10)</label>
                  <select
                    value={frustrationLevel}
                    onChange={(e) => setFrustrationLevel(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleObstacleSubmit}
                disabled={!obstacleInput.trim() || !emotionalState}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Get AI Solution
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={completePomodoro}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            Complete Session
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <X className="w-5 h-5 inline mr-2" />
            Cancel
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-400 mb-2">
            Completed Pomodoros: {completedPomodoros}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedPomodoros % 4) * 25}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
