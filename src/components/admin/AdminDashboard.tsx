import React, { useState, useEffect } from 'react';
import { Plus, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { JobCard, User } from '../../types';
import { jobCardAPI, userAPI } from '../../services/api';
import { CreateJobCardModal } from './CreateJobCardModal';
import { JobCardList } from './JobCardList';
import { EmployeeList } from './EmployeeList';
import { JobLogsView } from './JobLogsView';

type AdminView = 'dashboard' | 'jobcards' | 'employees' | 'logs';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobCardsResponse, employeesResponse] = await Promise.all([
        jobCardAPI.getAll(),
        userAPI.getEmployees(),
      ]);

      if (jobCardsResponse.status === 'success') {
        setJobCards(jobCardsResponse.data);
      }

      if (employeesResponse.status === 'success') {
        setEmployees(employeesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCardCreated = () => {
    loadData();
    setShowCreateModal(false);
  };

  const handleJobCardUpdated = () => {
    loadData();
  };

  const handleJobCardDeleted = () => {
    loadData();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'jobcards', label: 'Job Cards', icon: Plus },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'logs', label: 'Job Logs', icon: Settings },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Job Cards</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{jobCards.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Jobs</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {jobCards.filter(job => job.workstatus !== 'Completed').length}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Employees</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{employees.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed Jobs</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {jobCards.filter(job => job.workstatus === 'Completed').length}
              </p>
            </div>
          </div>
        );
      case 'jobcards':
        return (
          <JobCardList
            jobCards={jobCards}
            employees={employees}
            onJobCardUpdated={handleJobCardUpdated}
            onJobCardDeleted={handleJobCardDeleted}
          />
        );
      case 'employees':
        return <EmployeeList employees={employees} />;
      case 'logs':
        return <JobLogsView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-800 shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Welcome, {user?.name}</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as AdminView)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                currentView === item.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mt-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">
            {currentView === 'jobcards' ? 'Job Cards' : currentView}
          </h2>
          
          {currentView === 'jobcards' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Job Card</span>
            </button>
          )}
        </div>

        {renderContent()}
      </div>

      {/* Create Job Card Modal */}
      {showCreateModal && (
        <CreateJobCardModal
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onJobCardCreated={handleJobCardCreated}
        />
      )}
    </div>
  );
};