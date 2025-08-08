import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, MapPin, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { JobCard } from '../../types';
import { jobCardAPI } from '../../services/api';
import { JobCardDetails } from './JobCardDetails';

export const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobCards();
  }, [user]);

  const loadJobCards = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const response = await jobCardAPI.getByAssignedEmployee(user.email);
      
      if (response.status === 'success') {
        setJobCards(response.data);
      }
    } catch (error) {
      console.error('Failed to load job cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCardUpdated = () => {
    loadJobCards();
    setSelectedJobCard(null);
  };

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

  if (selectedJobCard) {
    return (
      <JobCardDetails
        jobCard={selectedJobCard}
        onBack={() => setSelectedJobCard(null)}
        onJobCardUpdated={handleJobCardUpdated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Employee Panel</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Welcome, {user?.name}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Job Cards</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Click on any job card to view details and update status
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCards.map((jobCard) => (
              <div
                key={jobCard.id}
                onClick={() => setSelectedJobCard(jobCard)}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {jobCard.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Job ID: {jobCard.jobid}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      jobCard.workstatus
                    )}`}
                  >
                    {jobCard.workstatus || 'Pending'}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                  {jobCard.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{jobCard.hoursnumber} hours allocated</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Generator: {jobCard.generatorid}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>Click to manage</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && jobCards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <Briefcase className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No job cards assigned
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              You don't have any job cards assigned to you yet. Check back later or contact your admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};