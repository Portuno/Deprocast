import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, X, Brain, Target, AlertTriangle, Trophy, Zap, Clock, BarChart3, Search, Globe, MessageSquare, Coffee, Focus } from 'lucide-react';
import MicroWinCelebration from './MicroWinCelebration';
import { insertTaskObstacle, calculateTimeSpent } from '../integrations/supabase/obstacles';

interface PomodoroTimerProps {
  isActive: boolean;
  onComplete: (data: TaskCompletionData) => void;
  onCancel: () => void;
  taskTitle: string;
  taskId: string;
  projectId: string | null;
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
  taskId,
  projectId,
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

  // Progress Ring Component
  const ProgressRing = ({ timeLeft, totalTime, phase }: { timeLeft: number; totalTime: number; phase: string }) => {
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    const strokeWidth = 8;
    const radius = 120;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getColor = () => {
      switch (phase) {
        case 'work': return '#60A5FA'; // blue-400
        case 'break': return '#34D399'; // green-400
        case 'longBreak': return '#A78BFA'; // purple-400
        default: return '#60A5FA';
      }
    };

    return (
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#374151"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Timer text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-7xl font-bold tracking-tight ${
              phase === 'work' ? 'text-blue-400' : 
              phase === 'break' ? 'text-green-400' : 'text-purple-400'
            }`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  const handleObstacleSubmit = useCallback(async () => {
    if (obstacleInput.trim() && emotionalState.trim()) {
      const obstacleData: ObstacleData = {
        description: obstacleInput,
        emotionalState,
        frustrationLevel,
        timeRemaining: timeLeft,
        timestamp: new Date().toISOString(),
        aiSolution: getAISolution(obstacleInput, emotionalState, frustrationLevel, timeLeft)
      };

      // Save obstacle to database
      try {
        const timeSpentMinutes = calculateTimeSpent(sessionStartTime);
        const timeRemainingSeconds = timeLeft;
        
        await insertTaskObstacle(
          projectId,
          taskId,
          obstacleInput.trim(),
          emotionalState,
          frustrationLevel,
          timeSpentMinutes,
          timeRemainingSeconds
        );

        console.log('Obstacle saved to database:', {
          taskId,
          projectId,
          description: obstacleInput.trim(),
          emotionalState,
          frustrationLevel,
          timeSpentMinutes,
          timeRemainingSeconds
        });
      } catch (error) {
        console.error('Error saving obstacle to database:', error);
        // Continue with local storage even if DB save fails
      }

      // Keep local state for immediate UI feedback
      setObstaclesEncountered(prev => [...prev, obstacleData]);
      setObstacleInput('');
      setEmotionalState('');
      setFrustrationLevel(5);
      setShowObstacleResolver(false);
    }
  }, [obstacleInput, emotionalState, frustrationLevel, timeLeft, sessionStartTime, taskId, projectId]);

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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-900/98 border border-gray-700/50 rounded-3xl p-12 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Dopamine Priming Prompt */}
        {showDopaminePrompt && (
          <div className="text-center mb-12">
            <div className="mb-8">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">🎯 Ready to Focus?</h2>
              <p className="text-xl text-gray-300 mb-2 max-w-2xl mx-auto leading-relaxed">
                {taskTitle}
              </p>
              <p className="text-gray-400 mb-8">
                Close your eyes, visualize success, then let's begin.
              </p>
            </div>
            <button
              onClick={startTimer}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-2xl"
            >
              <Zap className="w-6 h-6 inline mr-3" />
              Start Focus Session
            </button>
          </div>
        )}

        {/* Main Timer Section - The Heart of the Interface */}
        {!showDopaminePrompt && (
          <div className="text-center mb-12">
            {/* Huge Timer with Progress Ring */}
            <div className="flex justify-center mb-8">
              <ProgressRing 
                timeLeft={timeLeft} 
                totalTime={currentPhase === 'work' ? 25 * 60 : currentPhase === 'break' ? 5 * 60 : 15 * 60} 
                phase={currentPhase} 
              />
            </div>

            {/* Clear Session Label */}
            <div className="mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${
                currentPhase === 'work' ? 'text-blue-400' : 
                currentPhase === 'break' ? 'text-green-400' : 'text-purple-400'
              }`}>
                {currentPhase === 'work' ? 'Focus Session' : 
                 currentPhase === 'break' ? 'Break Time' : 'Long Break'}
              </h2>
              <p className="text-gray-400 text-lg">
                {currentPhase === 'work' ? taskTitle : 'Recharge your mind'}
              </p>
            </div>

            {/* Large, Intuitive Timer Controls */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Resume
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center"
                >
                  <Pause className="w-6 h-6 mr-3" />
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center"
              >
                <RotateCcw className="w-6 h-6 mr-3" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* External UI Elements - Outside the main card */}
        {!showDopaminePrompt && (
          <>
            {/* Left Side - Execution Rules Icons (2x2 Grid) - Aligned with card */}
            <div className="absolute -left-40 bottom-8">
              <div className="grid grid-cols-2 gap-4">
                {executionRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="group relative"
                    title={rule.description}
                  >
                    <div className={`p-5 rounded-full border-2 transition-all duration-200 cursor-help ${
                      rule.completed 
                        ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                        : 'bg-gray-800/40 border-gray-600/40 text-gray-400 hover:border-gray-500/60 hover:text-gray-300'
                    }`}>
                      <div className="w-7 h-7">
                        {rule.icon}
                      </div>
                    </div>
                    
                    {/* Tooltip on hover - Left side */}
                    <div className="absolute bottom-1/2 right-full transform translate-y-1/2 mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                      <div className="font-medium mb-1">{rule.title}</div>
                      <div className="text-xs text-gray-400">{rule.description}</div>
                      <div className="absolute top-1/2 left-full transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Top Controls - Aligned with card */}
            <div className="absolute -right-40 top-8 flex items-center gap-4">
              {/* Cancel Button */}
              <button
                onClick={onCancel}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-medium text-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
              
              {/* Stuck Button */}
              <button
                onClick={() => setShowObstacleResolver(!showObstacleResolver)}
                className={`bg-orange-500 hover:bg-orange-400 text-white p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 ${
                  showObstacleResolver ? 'ring-4 ring-orange-400/50' : ''
                }`}
                title="Stuck? Get help overcoming obstacles"
              >
                <AlertTriangle className="w-6 h-6" />
              </button>
            </div>

            {/* Right Side - Bottom - Complete Task Button - Aligned with card */}
            <div className="absolute -right-40 bottom-8">
              <button
                onClick={completePomodoro}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-200 hover:scale-105 shadow-2xl flex items-center"
              >
                <Trophy className="w-8 h-8 mr-3" />
                Task Completed
              </button>
            </div>
          </>
        )}

        {/* Progress Indicator */}
        {!showDopaminePrompt && (
          <div className="mt-12 text-center">
            <div className="text-sm text-gray-400 mb-3">
              Session Progress: {completedPomodoros} completed
            </div>
            <div className="w-48 bg-gray-700 rounded-full h-2 mx-auto">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedPomodoros % 4) * 25}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Obstacle Resolution Modal */}
      {showObstacleResolver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-orange-500/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Need Help?</h3>
              <p className="text-gray-400">Let's get you unstuck and back on track</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What's blocking you?</label>
                <textarea
                  value={obstacleInput}
                  onChange={(e) => setObstacleInput(e.target.value)}
                  placeholder="Describe what's stopping you from moving forward..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">How are you feeling?</label>
                  <select
                    value={emotionalState}
                    onChange={(e) => setEmotionalState(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select state...</option>
                    <option value="frustrated">😤 Frustrated</option>
                    <option value="overwhelmed">😰 Overwhelmed</option>
                    <option value="bored">😐 Bored</option>
                    <option value="anxious">😰 Anxious</option>
                    <option value="confused">😕 Confused</option>
                    <option value="tired">😴 Tired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Frustration (1-10)</label>
                  <select
                    value={frustrationLevel}
                    onChange={(e) => setFrustrationLevel(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleObstacleSubmit}
                  disabled={!obstacleInput.trim() || !emotionalState}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  Get AI Solution
                </button>
                <button
                  onClick={() => setShowObstacleResolver(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
