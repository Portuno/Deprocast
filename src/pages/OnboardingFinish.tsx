import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MicroTask } from '../types/microtasks';

const OnboardingFinish: React.FC = () => {
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock microtasks data - in real app, this would come from the onboarding process
  useEffect(() => {
    const mockTasks: MicroTask[] = [
      {
        id: '1',
        title: 'Set up your workspace',
        description: 'Organize your physical and digital workspace for maximum productivity',
        estimated_time: 15,
        priority: 'high',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Break down your first goal',
        description: 'Take your main project and break it into 3 smaller, actionable steps',
        estimated_time: 20,
        priority: 'high',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Schedule your first Pomodoro session',
        description: 'Block 25 minutes in your calendar for focused work on your first task',
        estimated_time: 5,
        priority: 'medium',
        status: 'pending'
      },
      {
        id: '4',
        title: 'Create your first journal entry',
        description: 'Reflect on what you accomplished and how you felt during your first session',
        estimated_time: 10,
        priority: 'medium',
        status: 'pending'
      },
      {
        id: '5',
        title: 'Set up your reward system',
        description: 'Define 3 small rewards you\'ll give yourself after completing tasks',
        estimated_time: 15,
        priority: 'low',
        status: 'pending'
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setMicroTasks(mockTasks);
      setIsLoading(false);
    }, 1500);
  }, []);

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
            ¡Onboarding Completado!
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Has superado el primer paso más importante. Ahora tienes las herramientas y el conocimiento para transformar tu productividad.
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
            Tu Persona de Usuario Está Activada
          </h2>
          <p className="text-gray-600 text-lg">
            Nuestro sistema ha analizado tus respuestas y ha creado un plan personalizado de microtareas. 
            Cada una está diseñada para darte pequeños éxitos que construyan tu confianza y momentum.
          </p>
        </div>

        {/* Microtasks Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🎯 Tus Microtareas Generadas
            </h2>
            <span className="text-sm text-gray-500">
              {microTasks.length} tareas listas para empezar
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Generando tus microtareas personalizadas...</p>
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
            🚀 Próximos Pasos
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-800">Elige tu primera tarea</h3>
              <p className="text-sm text-gray-600">
                Comienza con la tarea que te parezca más fácil o motivante
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="font-semibold text-gray-800">Configura tu timer</h3>
              <p className="text-sm text-gray-600">
                Usa el Pomodoro para mantenerte enfocado y productivo
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-gray-800">Documenta tu progreso</h3>
              <p className="text-sm text-gray-600">
                Registra cada logro en tu diario de crecimiento
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
            🚀 Ir al Dashboard
          </button>
          <p className="text-gray-500 mt-3 text-sm">
            Comienza tu viaje hacia la productividad sin límites
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFinish;
