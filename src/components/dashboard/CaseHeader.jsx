import React from 'react';
import { Scale, Calendar, FileText, MapPin } from 'lucide-react';

const CaseHeader = ({ probateCase }) => {
  if (!probateCase) return null;

  const { decedent, court, status, currentPhase } = probateCase;

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      on_hold: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'On Hold' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg shadow-lg p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-start">
          <div className="bg-white/10 p-3 rounded-lg mr-4">
            <Scale className="h-8 w-8" />
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Estate of</p>
            <h1 className="text-2xl font-bold">
              {decedent?.firstName} {decedent?.middleName ? `${decedent.middleName} ` : ''}{decedent?.lastName}
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Decedent
            </p>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
          {getStatusBadge(status)}
          {court?.caseNumber && (
            <p className="text-sm text-blue-200">
              Case No. {court.caseNumber}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-300 mr-2" />
          <div>
            <p className="text-blue-300 text-xs">Date of Death</p>
            <p className="font-medium">
              {decedent?.dateOfDeath
                ? new Date(decedent.dateOfDeath).toLocaleDateString()
                : 'Not specified'}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-blue-300 mr-2" />
          <div>
            <p className="text-blue-300 text-xs">County</p>
            <p className="font-medium">{court?.county || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-center">
          <FileText className="h-5 w-5 text-blue-300 mr-2" />
          <div>
            <p className="text-blue-300 text-xs">Current Phase</p>
            <p className="font-medium">Phase {currentPhase || 1}</p>
          </div>
        </div>

        <div className="flex items-center">
          <Scale className="h-5 w-5 text-blue-300 mr-2" />
          <div>
            <p className="text-blue-300 text-xs">Court</p>
            <p className="font-medium text-sm truncate max-w-[150px]">
              {court?.courthouse || 'TBD'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseHeader;
