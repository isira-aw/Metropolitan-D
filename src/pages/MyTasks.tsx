import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Calendar,
  MapPin,
  Filter,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { miniJobCardAPI } from '../services/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { StatusBadge } from '../components/UI/StatusBadge';
import { MiniJobCard, UpdateMiniJobCardRequest } from '../types/api';

export const MyTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<MiniJobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateMiniJobCardRequest>({});

  useEffect(() => {
    if (user?.email) {
      fetchTasks();
    }
  }, [user?.email]);

  const fetchTasks = async () => {
    if (!user?.email) return;
    
    try {
      const response = await miniJobCardAPI.getByEmployee(user.email);
      if (response.data.status) {
        setTasks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, updates: UpdateMiniJobCardRequest) => {
    try {
      await miniJobCardAPI.update(taskId, updates);
      await fetchTasks();
      setEditingTask(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const startEdit = (task: MiniJobCard) => {
    setEditingTask(task.miniJobCardId);
    setEditForm({
      status: task.status,
      location: task.location,
      time: task.time,
      date: task.date,
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditForm({});
  };

  const filteredTasks = statusFilter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your assigned tasks and update their status
          </p>
        </div>
        
        <div className="flex space-x-4">
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
            onClick={fetchTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.miniJobCardId} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              {editingTask === task.miniJobCardId ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Edit Task #{task.miniJobCardId.slice(-8)}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateTaskStatus(task.miniJobCardId, editForm)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Status
                      </label>
                      <select
                        value={editForm.status || task.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON_HOLD">On Hold</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={editForm.time || task.time}
                        onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editForm.location || task.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <StatusBadge status={task.status} />
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Task #{task.miniJobCardId.slice(-8)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
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

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(task)}
                      className="px-3 py-1 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => updateTaskStatus(task.miniJobCardId, { status: 'IN_PROGRESS' })}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    
                    {task.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => updateTaskStatus(task.miniJobCardId, { status: 'COMPLETED' })}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            {statusFilter === 'all' 
              ? 'No tasks assigned yet'
              : `No ${statusFilter.toLowerCase().replace('_', ' ')} tasks`
            }
          </p>
        </div>
      )}
    </div>
  );
};