import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, User, Search } from 'lucide-react';
import { JobEventLog } from '../../types';
import { jobEventLogAPI } from '../../services/api';

// --- Simple Map Component ---
const SimpleMap: React.FC<{ latitude: number; longitude: number; address: string }> = ({
  latitude,
  longitude,
  address,
}) => {
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">Location Details</h3>
      <div className="space-y-4">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Address:</span>
              <p className="text-white font-medium">{address}</p>
            </div>
            <div>
              <span className="text-slate-400">Coordinates:</span>
              <p className="text-white font-medium">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={openInGoogleMaps}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>Open in Google Maps</span>
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(`${latitude}, ${longitude}`)}
            className="flex items-center justify-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>Copy Coordinates</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Job Logs View Component with Popup Modal ---
export const JobLogsView: React.FC = () => {
  const [logs, setLogs] = useState<JobEventLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [selectedLog, setSelectedLog] = useState<JobEventLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const startDateTime = `${dateRange.startDate} 00:00:00`;
      const endDateTime = `${dateRange.endDate} 23:59:59`;

      const response = await jobEventLogAPI.getLogs(startDateTime, endDateTime);

      if (response.status === 'success') {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [dateRange]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'traveling':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'start':
      case 'work on':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'break':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'end':
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const openLogDetails = (log: JobEventLog) => {
    setSelectedLog(log);
  };

  const closeLogDetails = () => {
    setSelectedLog(null);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Filter Logs</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Job Event Logs ({logs.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              onClick={() => openLogDetails(log)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full  text-xs font-medium ${getStatusColor(
                        log.workstatuslog
                      )}`}
                    >
                      {log.workstatuslog}
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Job ID: {log.jobid}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{log.name} ({log.email})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{log.location || 'No location'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(log.eventTime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No logs found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your date range to see more results.
            </p>
          </div>
        )}
      </div>

      {/* Popup Modal for Log Details */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg w-11/12 md:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Job Log Details
              </h3>
              <button
                onClick={closeLogDetails}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                X
              </button>
            </div>

            <div className="space-y-4">
              {/* <div>
                <strong>Job ID:</strong> {selectedLog.jobid}
              </div>
              <div>
                <strong>Status:</strong> {selectedLog.workstatuslog}
              </div>
              <div>
                <strong>Employee Name:</strong> {selectedLog.name}
              </div>
              <div>
                <strong>Location:</strong> {selectedLog.location || 'No location'}
              </div>
              <div>
                <strong>Event Time:</strong> {formatDateTime(selectedLog.eventTime)}
              </div> */}

              {selectedLog.location && selectedLog.location.includes(',') && (
                <SimpleMap
                  latitude={parseFloat(selectedLog.location.split(',')[0].trim())}
                  longitude={parseFloat(selectedLog.location.split(',')[1].trim())}
                  address={selectedLog.location}
                />
              )}


            </div>
          </div>
        </div>
      )}
    </div>
  );
};
