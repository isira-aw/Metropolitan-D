import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Save, Navigation } from 'lucide-react';
import { JobCard, WorkStatus } from '../../types';
import { jobCardAPI, locationAPI } from '../../services/api';

interface JobCardDetailsProps {
  jobCard: JobCard;
  onBack: () => void;
  onJobCardUpdated: () => void;
}

export const JobCardDetails: React.FC<JobCardDetailsProps> = ({
  jobCard,
  onBack,
  onJobCardUpdated,
}) => {
  const [workStatus, setWorkStatus] = useState<string>(jobCard.workstatus || 'Pending');
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await locationAPI.getCurrentLocation();
      setLocation(`${position.latitude},${position.longitude}`);
    } catch (error) {
      console.error('Failed to get location:', error);
      setLocation('Location unavailable');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!location) {
      setError('Location is required to update status');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await jobCardAPI.updateByEmployee(jobCard.jobid, {
        workstatuslog: workStatus,
        location: location,
      });

      if (response.status === 'success') {
        onJobCardUpdated();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to update job card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const workStatusOptions: WorkStatus[] = [
    'Pending',
    'Traveling',
    'Start',
    'Break',
    'End',
    'Completed',
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'traveling':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'start':
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Job Cards</span>
            </button>
            
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(workStatus)}`}
            >
              {workStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Job Card Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {jobCard.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>Job ID: {jobCard.jobid}</span>
              <span>Generator ID: {jobCard.generatorid}</span>
              <span>Duration: {jobCard.hoursnumber} hours</span>
            </div>
          </div>

          {/* Job Description */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Job Description
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {jobCard.description}
            </p>
          </div>

          {/* Status Update Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Update Job Status
            </h2>

            <div className="space-y-6">
              {/* Work Status Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Work Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {workStatusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => setWorkStatus(status)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        workStatus === status
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Section */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Current Location
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        placeholder="Enter your location or coordinates"
                      />
                    </div>
                  </div>
                  <button
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
                    title="Get current location"
                  >
                    {locationLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Update Button */}
              <button
                onClick={handleStatusUpdate}
                disabled={loading || !location}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Update Status & Location</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Important Note
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Your location and status updates are automatically logged and shared with the admin panel for tracking purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};