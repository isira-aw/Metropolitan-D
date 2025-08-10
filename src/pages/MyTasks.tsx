import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, CheckSquare, Navigation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { MiniJobCardResponse, TaskStatus, UpdateMiniJobCardRequest } from '../types/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { StatusBadge } from '../components/UI/StatusBadge';
import { Modal } from '../components/UI/Modal';

export const MyTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<MiniJobCardResponse[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<MiniJobCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | TaskStatus>('ALL');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingTask, setUpdatingTask] = useState<MiniJobCardResponse | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateMiniJobCardRequest>({});
  
  // Location states
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lon: number} | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadTasks();
    }
  }, [user]);

  useEffect(() => {
    filterTasks();
  }, [tasks, filterStatus]);

  // Get current location when modal opens
  useEffect(() => {
    if (showUpdateModal && !currentLocation) {
      getCurrentLocation();
    }
  }, [showUpdateModal]);

  // Fetch address when location changes
  useEffect(() => {
    if (currentLocation) {
      fetchLocationAddress();
    }
  }, [currentLocation]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lon: longitude };
        setCurrentLocation(location);
        
        // Store the coordinates as the location value for API
        setUpdateForm(prev => ({ 
          ...prev, 
          location: `${latitude},${longitude}` 
        }));
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationAddress('Unable to get current location');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const fetchLocationAddress = async () => {
    if (!currentLocation) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${currentLocation.lat}&lon=${currentLocation.lon}&format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        setLocationAddress(data.display_name || 'Address not found');
      } else {
        setLocationAddress('Unable to fetch address');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setLocationAddress('Error fetching address');
    }
  };

  const loadTasks = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const response = await apiService.getMiniJobCardsByEmployee(user.email);
      if (response.status && response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    if (filterStatus === 'ALL') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === filterStatus));
    }
  };

  const handleUpdateTask = (task: MiniJobCardResponse) => {
    setUpdatingTask(task);
    setUpdateForm({
      status: task.status,
      location: task.location,
      time: task.time,
      date: task.date
    });
    setShowUpdateModal(true);
    
    // Reset location states for fresh data
    setCurrentLocation(null);
    setLocationAddress('');
  };

  const handleSaveUpdate = async () => {
    if (!updatingTask) return;

    try {
      const response = await apiService.updateMiniJobCard(updatingTask.miniJobCardId, updateForm);
      if (response.status) {
        await loadTasks();
        setShowUpdateModal(false);
        setUpdatingTask(null);
        setUpdateForm({});
        setCurrentLocation(null);
        setLocationAddress('');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const quickStatusUpdate = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await apiService.updateMiniJobCard(taskId, { status });
      if (response.status) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statusOptions: (TaskStatus | 'ALL')[] = ['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
        <p className="text-slate-600 mt-2">Manage your assigned tasks and update their status</p>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Tasks' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.miniJobCardId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Task #{task.miniJobCardId.slice(-8)}</p>
                  <p className="text-sm text-slate-500">Job Card Task</p>
                </div>
              </div>
              <StatusBadge status={task.status} />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(task.date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(task.time)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{task.location || 'No location specified'}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              {task.status === 'PENDING' && (
                <button
                  onClick={() => quickStatusUpdate(task.miniJobCardId, 'IN_PROGRESS')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Start Task
                </button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => quickStatusUpdate(task.miniJobCardId, 'COMPLETED')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Mark Complete
                </button>
              )}
              <button
                onClick={() => handleUpdateTask(task)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Update Details
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Last updated {formatDate(task.updatedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            {filterStatus === 'ALL' ? 'No tasks assigned to you' : `No ${filterStatus.toLowerCase().replace('_', ' ')} tasks`}
          </p>
        </div>
      )}

      {/* Update Task Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setUpdatingTask(null);
          setUpdateForm({});
          setCurrentLocation(null);
          setLocationAddress('');
        }}
        title="Update Task"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={updateForm.status || ''}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Location
              <span className="text-xs text-slate-500 ml-1">(Auto-detected)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationAddress || 'Getting current location...'}
                readOnly
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                placeholder="Detecting location..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {locationLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <Navigation className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>
            {currentLocation && (
              <p className="text-xs text-slate-500 mt-1">
                Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lon.toFixed(6)}
              </p>
            )}
            {!locationLoading && !currentLocation && (
              <button
                onClick={getCurrentLocation}
                className="text-xs text-blue-600 hover:text-blue-700 mt-1"
              >
                Retry getting location
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                type="date"
                value={updateForm.date || ''}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
              <div className="flex gap-2">
                <select
                  value={updateForm.time?.split(':')[0] || ''}
                  onChange={(e) => {
                    const hour = e.target.value;
                    const minute = updateForm.time?.split(':')[1] || '00';
                    setUpdateForm(prev => ({ ...prev, time: `${hour}:${minute}` }));
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Hour</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="flex items-center text-slate-500 px-2">:</span>
                <select
                  value={updateForm.time?.split(':')[1] || ''}
                  onChange={(e) => {
                    const minute = e.target.value;
                    const hour = updateForm.time?.split(':')[0] || '00';
                    setUpdateForm(prev => ({ ...prev, time: `${hour}:${minute}` }));
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Min</option>
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowUpdateModal(false);
                setUpdatingTask(null);
                setUpdateForm({});
                setCurrentLocation(null);
                setLocationAddress('');
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUpdate}
              disabled={locationLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              Update Task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};