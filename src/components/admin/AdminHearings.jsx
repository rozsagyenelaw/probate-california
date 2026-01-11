import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Gavel,
  Calendar,
  Clock,
  MapPin,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Video,
  Users
} from 'lucide-react';

const AdminHearings = () => {
  const navigate = useNavigate();
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'

  useEffect(() => {
    // Subscribe to cases with hearing details
    const unsubscribe = onSnapshot(collection(db, 'cases'), (snapshot) => {
      const casesWithHearings = [];

      snapshot.docs.forEach(doc => {
        const caseData = doc.data();

        // Check if case has court appearance hearing details
        if (caseData.hearingDetails && caseData.hearingDetails.hearingDate) {
          casesWithHearings.push({
            id: doc.id,
            caseId: doc.id,
            estateName: caseData.estateName || `Estate of ${caseData.decedent?.firstName || ''} ${caseData.decedent?.lastName || ''}`.trim(),
            petitioner: caseData.petitioner,
            courtAppearance: caseData.courtAppearance,
            ...caseData.hearingDetails
          });
        }
      });

      // Sort by hearing date
      casesWithHearings.sort((a, b) => {
        const dateA = new Date(a.hearingDate);
        const dateB = new Date(b.hearingDate);
        return dateA - dateB;
      });

      setHearings(casesWithHearings);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching hearings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isUpcoming = (dateString) => {
    const hearingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return hearingDate >= today;
  };

  const getDaysUntil = (dateString) => {
    const hearingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    hearingDate.setHours(0, 0, 0, 0);
    const diffTime = hearingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getHearingTypeLabel = (type) => {
    const labels = {
      'petition_hearing': 'Petition for Probate Hearing',
      'inventory_hearing': 'Inventory Hearing',
      'accounting_hearing': 'Accounting Hearing',
      'final_distribution': 'Final Distribution Hearing',
      'status_conference': 'Status Conference',
      'motion_hearing': 'Motion Hearing',
      'other': 'Other Hearing'
    };
    return labels[type] || type || 'Hearing';
  };

  // Filter hearings
  const filteredHearings = hearings.filter(hearing => {
    // Apply date filter
    if (filter === 'upcoming' && !isUpcoming(hearing.hearingDate)) return false;
    if (filter === 'past' && isUpcoming(hearing.hearingDate)) return false;

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        hearing.estateName?.toLowerCase().includes(search) ||
        hearing.caseNumber?.toLowerCase().includes(search) ||
        hearing.county?.toLowerCase().includes(search) ||
        hearing.petitioner?.firstName?.toLowerCase().includes(search) ||
        hearing.petitioner?.lastName?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Stats
  const upcomingCount = hearings.filter(h => isUpcoming(h.hearingDate)).length;
  const thisWeekCount = hearings.filter(h => {
    const days = getDaysUntil(h.hearingDate);
    return days >= 0 && days <= 7;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Court Hearings</h1>
        <p className="text-gray-500">Manage upcoming court appearances</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Hearings</p>
              <p className="text-3xl font-bold text-gray-900">{hearings.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Gavel className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">This Week</p>
              <p className="text-3xl font-bold text-gray-900">{thisWeekCount}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by estate name, case number, or county..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Hearings List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredHearings.length === 0 ? (
          <div className="p-12 text-center">
            <Gavel className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hearings Found</h3>
            <p className="text-gray-500">
              {filter === 'upcoming'
                ? 'There are no upcoming court hearings scheduled.'
                : filter === 'past'
                  ? 'No past hearings found.'
                  : 'No court hearings have been scheduled yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredHearings.map((hearing) => {
              const daysUntil = getDaysUntil(hearing.hearingDate);
              const upcoming = isUpcoming(hearing.hearingDate);

              return (
                <div
                  key={hearing.id}
                  onClick={() => navigate(`/admin/cases/${hearing.caseId}`)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header row with estate name and appearance type */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{hearing.estateName}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          hearing.courtAppearance === 'remote'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {hearing.courtAppearance === 'remote' ? (
                            <><Video className="h-3 w-3 mr-1" /> Remote</>
                          ) : (
                            <><Users className="h-3 w-3 mr-1" /> Contested/Complex</>
                          )}
                        </span>
                        {upcoming ? (
                          daysUntil <= 7 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Upcoming
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Past
                          </span>
                        )}
                      </div>

                      {/* Hearing details */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(hearing.hearingDate)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {formatTime(hearing.hearingTime)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {hearing.county} County {hearing.department && `- Dept ${hearing.department}`}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Gavel className="h-4 w-4 mr-2 text-gray-400" />
                          {getHearingTypeLabel(hearing.hearingType)}
                        </div>
                      </div>

                      {/* Case number */}
                      {hearing.caseNumber && (
                        <p className="text-xs text-gray-400 mt-2">
                          Case #: {hearing.caseNumber}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHearings;
