import React, { useState, useEffect } from 'react';
import { Users, Zap, ClipboardList, CheckSquare, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { EmployeeResponse, GeneratorResponse, JobCardResponse, MiniJobCardResponse, LogResponse } from '../types/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { StatusBadge } from '../components/UI/StatusBadge';

interface DashboardStats {
  totalEmployees: number;
  totalGenerators: number;
  totalJobs: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
}

export const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalGenerators: 0,
    totalJobs: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState<MiniJobCardResponse[]>([]);
  const [recentActivity, setRecentActivity] = useState<LogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user, isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isAdmin) {
        // Load admin dashboard data
        const [employeesRes, generatorsRes, jobsRes, tasksRes, logsRes] = await Promise.all([
          apiService.getAllEmployees(),
          apiService.getAllGenerators(),
          apiService.getAllJobCards(),
          apiService.getAllMiniJobCards(),
          apiService.getRecentLogs(24)
        ]);

        if (employeesRes.status && generatorsRes.status && jobsRes.status && tasksRes.status) {
          const tasks = tasksRes.data || [];
          setStats({
            totalEmployees: employeesRes.data?.length || 0,
            totalGenerators: generatorsRes.data?.length || 0,
            totalJobs: jobsRes.data?.length || 0,
            totalTasks: tasks.length,
            pendingTasks: tasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED').length,
            completedTasks: tasks.filter(t => t.status === 'COMPLETED').length
          });
          setRecentTasks(tasks.slice(0, 5));
        }

        if (logsRes.status) {
          setRecentActivity(logsRes.data?.slice(0, 10) || []);
        }
      } else {
        // Load employee dashboard data
        const [tasksRes, logsRes] = await Promise.all([
          apiService.getMiniJobCardsByEmployee(user?.email || ''),
          apiService.getLogsByEmployee(user?.email || '')
        ]);

        if (tasksRes.status) {
          const tasks = tasksRes.data || [];
          setStats(prev => ({
            ...prev,
            totalTasks: tasks.length,
            pendingTasks: tasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED').length,
            completedTasks: tasks.filter(t => t.status === 'COMPLETED').length
          }));
          setRecentTasks(tasks.slice(0, 5));
        }

        if (logsRes.status) {
          setRecentActivity(logsRes.data?.slice(0, 10) || []);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const adminCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Generators',
      value: stats.totalGenerators,
      icon: Zap,
      color: 'bg-yellow-500',
      change: '+5%'
    },
    {
      title: 'Job Cards',
      value: stats.totalJobs,
      icon: ClipboardList,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'bg-purple-500',
      change: '+15%'
    }
  ];

  const employeeCards = [
    {
      title: 'My Tasks',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'bg-blue-500',
      change: '+3'
    },
    {
      title: 'Pending',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-2'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+5'
    }
  ];

  const cards = isAdmin ? adminCards : employeeCards;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        {/* <p className="text-slate-600 mt-2">
          {isAdmin ? 'System overview and management' : 'Your personal workspace'}
        </p> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
                <p className="text-sm text-green-600 mt-1">{card.change} from last month</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {isAdmin ? 'Recent Tasks' : 'My Recent Tasks'}
          </h3>
          <div className="space-y-4">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.miniJobCardId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{task.employeeName}</p>
                    <p className="text-sm text-slate-600">{task.location}</p>
                    <p className="text-xs text-slate-500">{task.date} at {task.time}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No tasks found</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div key={log.logId} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{log.employeeName}</span> {log.action.toLowerCase().replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-500">{log.status}</p>
                    <p className="text-xs text-slate-400">{log.date} at {log.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};