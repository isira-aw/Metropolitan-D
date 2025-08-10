import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Zap, 
  Clipboard, 
  CheckSquare, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { employeeAPI, generatorAPI, jobCardAPI, miniJobCardAPI, activityLogAPI } from '../../services/api';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { StatusBadge } from '../../components/UI/StatusBadge';

interface DashboardStats {
  totalEmployees: number;
  totalGenerators: number;
  totalJobs: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalGenerators: 0,
    totalJobs: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        employeesRes,
        generatorsRes,
        jobsRes,
        tasksRes,
        pendingTasksRes,
        completedTasksRes,
        inProgressTasksRes,
        activityRes
      ] = await Promise.all([
        employeeAPI.getAll(),
        generatorAPI.getAll(),
        jobCardAPI.getAll(),
        miniJobCardAPI.getAll(),
        miniJobCardAPI.getByStatus('PENDING'),
        miniJobCardAPI.getByStatus('COMPLETED'),
        miniJobCardAPI.getByStatus('IN_PROGRESS'),
        activityLogAPI.getRecent(24)
      ]);

      setStats({
        totalEmployees: employeesRes.data.data?.length || 0,
        totalGenerators: generatorsRes.data.data?.length || 0,
        totalJobs: jobsRes.data.data?.length || 0,
        totalTasks: tasksRes.data.data?.length || 0,
        pendingTasks: pendingTasksRes.data.data?.length || 0,
        completedTasks: completedTasksRes.data.data?.length || 0,
        inProgressTasks: inProgressTasksRes.data.data?.length || 0,
      });

      setRecentActivity(activityRes.data.data?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Generators',
      value: stats.totalGenerators,
      icon: Zap,
      color: 'bg-yellow-500',
      change: '+5%',
    },
    {
      title: 'Job Cards',
      value: stats.totalJobs,
      icon: Clipboard,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'bg-purple-500',
      change: '+15%',
    },
  ];

  const taskStats = [
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Overview of your Employee Management System
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {taskStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white">
                      <span className="font-medium">{activity.employeeName}</span> {activity.action.toLowerCase().replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activity.status} • {activity.location} • {activity.date} at {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};