import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MicroTask } from '../types/microtasks';
import { supabase } from '../integrations/supabase/client';

const OnboardingFinish: React.FC = () => {
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch real microtasks from Supabase
  useEffect(() => {
    const fetchMicroTasks = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('micro_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching microtasks:', error);
          return;
        }

        console.log('🎯 OnboardingFinish: Fetched microtasks:', data);
        setMicroTasks(data || []);
      } catch (error) {
        console.error('Error fetching microtasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMicroTasks();
  }, [user]);

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚡';
      case 'low':
        return '🌱';
      default:
        return '📋';
    }
  };

  if (!user) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🎉 Onboarding Complete!
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            You've completed the most important first step. Now you have the tools and knowledge to transform your productivity.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Your User Persona is Activated
          </h2>
          <p className="text-gray-600 text-lg">
            Our system has analyzed your responses and created a personalized microtask plan. 
            Each one is designed to give you small wins that build your confidence and momentum.
          </p>
        </div>

        {/* Microtasks Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🎯 Your Generated Microtasks
            </h2>
            <span className="text-sm text-gray-500">
              {microTasks.length} tasks ready to start
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your personalized microtasks...</p>
            </div>
          ) : microTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No microtasks found</h3>
              <p className="text-gray-500">Your microtasks will appear here once they're generated.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {microTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl font-bold text-purple-600">
                      {index + 1}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)} {task.priority}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                    {task.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>⏱️ {task.estimated_time} min</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🚀 Next Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-800">Choose your first task</h3>
              <p className="text-sm text-gray-600">
                Start with the task that seems easiest or most motivating
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="font-semibold text-gray-800">Set up your timer</h3>
              <p className="text-sm text-gray-600">
                Use Pomodoro to stay focused and productive
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-gray-800">Document your progress</h3>
              <p className="text-sm text-gray-600">
                Record each achievement in your growth journal
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleGoToDashboard}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg"
          >
            🚀 Go to Dashboard
          </button>
          <p className="text-gray-500 mt-3 text-sm">
            Start your journey to unlimited productivity
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFinish;
