import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import moment from 'moment';

const KeyDates = ({ probateCase }) => {
  if (!probateCase) return null;

  const { phases } = probateCase;

  // Calculate key dates based on case data
  const calculateDates = () => {
    const dates = [];

    // First Hearing Date
    if (phases?.phase5_firstHearing?.hearingDate) {
      dates.push({
        label: 'First Hearing',
        date: phases.phase5_firstHearing.hearingDate,
        time: phases.phase5_firstHearing.hearingTime,
        department: phases.phase5_firstHearing.department,
        type: 'hearing'
      });
    }

    // Letters Issued - Calculate dependent deadlines
    if (phases?.phase7_letters?.lettersIssuedDate) {
      const lettersDate = moment(phases.phase7_letters.lettersIssuedDate);

      // Inventory deadline (4 months from letters)
      if (!phases?.phase8_inventory?.inventoryFiledDate) {
        dates.push({
          label: 'Inventory Due',
          date: lettersDate.clone().add(4, 'months').format('YYYY-MM-DD'),
          type: 'deadline'
        });
      }

      // Creditor period end (4 months from letters)
      dates.push({
        label: 'Creditor Period Ends',
        date: lettersDate.clone().add(4, 'months').format('YYYY-MM-DD'),
        type: 'deadline'
      });
    }

    // Final Distribution Hearing
    if (phases?.phase10_distribution?.hearingDate) {
      dates.push({
        label: 'Final Hearing',
        date: phases.phase10_distribution.hearingDate,
        type: 'hearing'
      });
    }

    // Publication dates
    if (phases?.phase3_publication?.publicationDates?.length > 0) {
      const lastPubDate = phases.phase3_publication.publicationDates[
        phases.phase3_publication.publicationDates.length - 1
      ];
      dates.push({
        label: 'Last Publication',
        date: lastPubDate,
        type: 'milestone'
      });
    }

    return dates.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const dates = calculateDates();

  const getDateStatus = (dateStr) => {
    const date = moment(dateStr);
    const today = moment();
    const daysUntil = date.diff(today, 'days');

    if (daysUntil < 0) return { status: 'past', label: 'Passed' };
    if (daysUntil === 0) return { status: 'today', label: 'Today' };
    if (daysUntil <= 7) return { status: 'urgent', label: `${daysUntil} days` };
    if (daysUntil <= 30) return { status: 'soon', label: `${daysUntil} days` };
    return { status: 'future', label: date.format('MMM D, YYYY') };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'past':
        return 'bg-gray-100 text-gray-500';
      case 'today':
        return 'bg-red-100 text-red-700';
      case 'urgent':
        return 'bg-orange-100 text-orange-700';
      case 'soon':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (dates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Key Dates</h3>
        </div>
        <p className="text-gray-500 text-sm">
          Key dates will appear here as your case progresses.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-900 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Key Dates</h3>
        </div>
      </div>

      <div className="space-y-3">
        {dates.map((item, index) => {
          const dateStatus = getDateStatus(item.date);
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                dateStatus.status === 'urgent' || dateStatus.status === 'today'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                {dateStatus.status === 'urgent' || dateStatus.status === 'today' ? (
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                ) : dateStatus.status === 'past' ? (
                  <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                ) : (
                  <Clock className="h-5 w-5 text-blue-500 mr-3" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">
                    {moment(item.date).format('MMMM D, YYYY')}
                    {item.time && ` at ${item.time}`}
                    {item.department && ` - Dept. ${item.department}`}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                  dateStatus.status
                )}`}
              >
                {dateStatus.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeyDates;
