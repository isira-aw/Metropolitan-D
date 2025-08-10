import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  Calendar,
  MapPin,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { miniJobCardAPI, activityLogAPI } from '../../services/api';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { MiniJobCard } from '../../types/api';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<MiniJobCard[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<MiniJobCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.email) {
      fetchEmployeeData();
    }
  }, [user?.email]);

  useEffect(() => {
    filterTasks();
  }, [tasks, dateFilter, statusFilter]);

  const fetchEmployeeData = async () => {
    if (!user?.email) return;
    
    try {
      const [tasksRes, activityRes] = await Promise.all([
        miniJobCardAPI.getByEmployee(user.email),
        activityLogAPI.getByEmployee(user.email)
      ]);

      setTasks(tasksRes.data.data || []);
      setRecentActivity(activityRes.data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Date filter
    if (dateFilter === 'today') {
      filtered = filtered.filter(task => isToday(parseISO(task.date)));
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(task => isThisWeek(parseISO(task.date)));
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    setFilteredTasks(filtered);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await miniJobCardAPI.update(taskId, { status: newStatus as any });
      await fetchEmployeeData(); // Refresh data
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getTaskStats = () => {
    const pending = tasks.filter(t => t.status === 'PENDING').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    
    return { pending, inProgress, completed, total: tasks.length };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100">
          You have {stats.pending} pending tasks and {stats.inProgress} in progress.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              My Tasks
            </h2>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>

              <button
                onClick={fetchEmployeeData}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.miniJobCardId} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <StatusBadge status={task.status} />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Task #{task.miniJobCardId.slice(-8)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(parseISO(task.date), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{task.time}</span>
                        </div>
                        {task.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{task.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                      {task.status === 'PENDING' && (
                        <button
                          onClick={() => updateTaskStatus(task.miniJobCardId, 'IN_PROGRESS')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateTaskStatus(task.miniJobCardId, 'COMPLETED')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                {dateFilter === 'all' && statusFilter === 'all' 
                  ? 'No tasks assigned yet'
                  : 'No tasks match your filters'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};