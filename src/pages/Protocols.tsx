import React, { useState } from 'react';
import { Play, Clock, Plus, BookOpen, Target, Coffee, Settings as SettingsIcon } from 'lucide-react';
import { Protocol, protocols } from '../data/mockData';

const Protocols: React.FC = () => {
  const [protocolList, setProtocolList] = useState<Protocol[]>(protocols);
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const categoryIcons = {
    focus: { icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    planning: { icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    review: { icon: SettingsIcon, color: 'text-green-400', bg: 'bg-green-500/20' },
    break: { icon: Coffee, color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
  };

  const startProtocol = (protocol: Protocol) => {
    setActiveProtocol(protocol);
    setCurrentStep(0);
    setIsRunning(true);
  };

  const nextStep = () => {
    if (activeProtocol && currentStep < activeProtocol.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeProtocol();
    }
  };

  const completeProtocol = () => {
    setActiveProtocol(null);
    setCurrentStep(0);
    setIsRunning(false);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Protocols</h1>
            <p className="text-gray-400">Structured workflows to boost your productivity</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>New Protocol</span>
          </button>
        </div>

        {/* Active Protocol */}
        {activeProtocol && isRunning && (
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-xl border border-blue-400/30 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{activeProtocol.name}</h2>
                <p className="text-blue-300">Step {currentStep + 1} of {activeProtocol.steps.length}</p>
              </div>
              <div className="flex items-center space-x-2 text-blue-300">
                <Clock className="w-5 h-5" />
                <span>{activeProtocol.duration} min</span>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Current Step:</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {activeProtocol.steps[currentStep]}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / activeProtocol.steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div
                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / activeProtocol.steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={nextStep}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:glow-md"
              >
                {currentStep < activeProtocol.steps.length - 1 ? 'Next Step' : 'Complete Protocol'}
              </button>
              <button
                onClick={completeProtocol}
                className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg font-medium transition-all duration-200"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {/* Protocols Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protocolList.map((protocol) => {
            const CategoryIcon = categoryIcons[protocol.category].icon;
            
            return (
              <div
                key={protocol.id}
                className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-xl p-6 hover:bg-gray-800/40 hover:border-gray-600/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${categoryIcons[protocol.category].bg}`}>
                    <CategoryIcon className={`w-6 h-6 ${categoryIcons[protocol.category].color}`} />
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{protocol.duration} min</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{protocol.name}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{protocol.description}</p>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Steps:</h4>
                  <div className="space-y-1">
                    {protocol.steps.slice(0, 3).map((step, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-xs text-gray-500 mt-1">{index + 1}.</span>
                        <span className="text-xs text-gray-400 leading-relaxed">{step}</span>
                      </div>
                    ))}
                    {protocol.steps.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{protocol.steps.length - 3} more steps
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => startProtocol(protocol)}
                  disabled={isRunning}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isRunning
                      ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white hover:shadow-lg hover:glow-sm transform hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Start Protocol</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {protocolList.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Protocols Yet</h3>
            <p className="text-gray-500 mb-6">Create your first productivity protocol to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-200"
            >
              Create Protocol
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Protocols;