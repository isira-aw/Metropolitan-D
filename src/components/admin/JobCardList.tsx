import React, { useState } from 'react';
import { Edit, Trash2, User, Clock, MapPin } from 'lucide-react';
import { JobCard, User as UserType } from '../../types';
import { jobCardAPI } from '../../services/api';
import { EditJobCardModal } from './EditJobCardModal';

interface JobCardListProps {
  jobCards: JobCard[];
  employees: UserType[];
  onJobCardUpdated: () => void;
  onJobCardDeleted: () => void;
}

export const JobCardList: React.FC<JobCardListProps> = ({
  jobCards,
  employees,
  onJobCardUpdated,
  onJobCardDeleted,
}) => {
  const [editingJobCard, setEditingJobCard] = useState<JobCard | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Categorizing job cards by date
  const categorizeJobCardsByDate = (jobCards: JobCard[]) => {
    return jobCards.reduce((acc, jobCard) => {
      const date = jobCard.date; // Assuming date is in "YYYY-MM-DD" format
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(jobCard);
      return acc;
    }, {} as Record<string, JobCard[]>);
  };

  const categorizedJobCards = categorizeJobCardsByDate(jobCards);

  // Sorting dates to have today's date first
const sortedDates = Object.keys(categorizedJobCards).sort((a, b) => {
  // Parse the date strings into Date objects for comparison
  const dateA = new Date(a);
  const dateB = new Date(b);

  // Compare dates, placing today's date at the top
  if (dateA.toDateString() === new Date().toDateString()) {
    return -1; // Move today's date to the top
  } else if (dateB.toDateString() === new Date().toDateString()) {
    return 1;
  }

  // Compare dates numerically using getTime() (most recent first)
  return dateB.getTime() - dateA.getTime();
});


  const handleDelete = async (jobid: string) => {
    if (!confirm('Are you sure you want to delete this job card?')) {
      return;
    }

    try {
      setDeletingJobId(jobid);
      const response = await jobCardAPI.delete(jobid);
      
      if (response.status === 'success') {
        onJobCardDeleted();
      }
    } catch (error) {
      console.error('Failed to delete job card:', error);
    } finally {
      setDeletingJobId(null);
    }
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

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Job Cards for {date}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {categorizedJobCards[date].map((jobCard) => (
              <div
                key={jobCard.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
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

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{jobCard.hoursnumber} hours</span>
                  </div>
                  
                  {jobCard.assignTo && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <User className="w-4 h-4 mr-2" />
                      <span>{jobCard.assignTo.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Generator: {jobCard.generatorid}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingJobCard(jobCard)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit job card"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(jobCard.jobid)}
                    disabled={deletingJobId === jobCard.jobid}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete job card"
                  >
                    {deletingJobId === jobCard.jobid ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {jobCards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 dark:text-slate-500 mb-4">
            <Clock className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No job cards found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Create your first job card to get started.
          </p>
        </div>
      )}

      {editingJobCard && (
        <EditJobCardModal
          jobCard={editingJobCard}
          employees={employees}
          onClose={() => setEditingJobCard(null)}
          onJobCardUpdated={onJobCardUpdated}
        />
      )}
    </div>
  );
};
