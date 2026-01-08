import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

const PHASES = [
  { number: 1, name: 'Intake', shortName: 'Intake' },
  { number: 2, name: 'Petition', shortName: 'Petition' },
  { number: 3, name: 'Publication', shortName: 'Publication' },
  { number: 4, name: 'Bond', shortName: 'Bond' },
  { number: 5, name: 'First Hearing', shortName: 'Hearing' },
  { number: 6, name: 'Supplements', shortName: 'Supplements' },
  { number: 7, name: 'Letters', shortName: 'Letters' },
  { number: 8, name: 'Inventory', shortName: 'Inventory' },
  { number: 9, name: 'Creditors', shortName: 'Creditors' },
  { number: 10, name: 'Distribution', shortName: 'Distribution' },
  { number: 11, name: 'Closing', shortName: 'Closing' }
];

const PhaseTracker = ({ currentPhase = 1, phases = {} }) => {
  const getPhaseStatus = (phaseNumber) => {
    const phaseKey = `phase${phaseNumber}_${PHASES[phaseNumber - 1].name.toLowerCase().replace(' ', '')}`;
    const phaseData = phases[phaseKey];

    if (phaseData?.status === 'complete') return 'completed';
    if (phaseNumber === currentPhase) return 'current';
    if (phaseNumber < currentPhase) return 'completed';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Case Progress</h2>
        <span className="text-sm text-gray-500">
          Phase {currentPhase} of 11
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{Math.round((currentPhase / 11) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-900 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentPhase / 11) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Phase Steps - Desktop */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200"></div>
          <div
            className="absolute top-4 left-4 h-0.5 bg-blue-900 transition-all duration-500"
            style={{ width: `${Math.max(0, ((currentPhase - 1) / 10) * 100)}%` }}
          ></div>

          {/* Phase Circles */}
          <div className="relative flex justify-between">
            {PHASES.map((phase) => {
              const status = getPhaseStatus(phase.number);
              return (
                <div key={phase.number} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      status === 'completed'
                        ? 'bg-green-500 text-white'
                        : status === 'current'
                        ? 'bg-blue-900 text-white ring-4 ring-blue-200'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : status === 'current' ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{phase.number}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs text-center max-w-[60px] ${
                      status === 'current'
                        ? 'font-medium text-blue-900'
                        : status === 'completed'
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {phase.shortName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase Steps - Mobile */}
      <div className="lg:hidden space-y-2">
        {PHASES.map((phase) => {
          const status = getPhaseStatus(phase.number);
          return (
            <div
              key={phase.number}
              className={`flex items-center p-3 rounded-lg ${
                status === 'current'
                  ? 'bg-blue-50 border border-blue-200'
                  : status === 'completed'
                  ? 'bg-green-50'
                  : 'bg-gray-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  status === 'completed'
                    ? 'bg-green-500 text-white'
                    : status === 'current'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {status === 'completed' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{phase.number}</span>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    status === 'current'
                      ? 'text-blue-900'
                      : status === 'completed'
                      ? 'text-green-700'
                      : 'text-gray-500'
                  }`}
                >
                  Phase {phase.number}: {phase.name}
                </p>
                {status === 'current' && (
                  <p className="text-xs text-blue-600 mt-0.5">In Progress</p>
                )}
              </div>
              {status === 'current' && (
                <Clock className="h-5 w-5 text-blue-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PhaseTracker;
