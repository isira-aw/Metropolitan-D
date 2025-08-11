import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, CheckSquare, Navigation, X } from 'lucide-react';
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
  const [filterDate, setFilterDate] = useState<string>('');
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
  }, [tasks, filterDate]);

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
        // Sort tasks: today's tasks first, then by date
        const sortedTasks = response.data.sort((a, b) => {
          const today = new Date().toISOString().split('T')[0];
          const aDate = a.date;
          const bDate = b.date;
          
          // Check if tasks are for today
          const aIsToday = aDate === today;
          const bIsToday = bDate === today;
          
          // Today's tasks come first
          if (aIsToday && !bIsToday) return -1;
          if (!aIsToday && bIsToday) return 1;
          
          // If both are today or both are not today, sort by date (newest first)
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        });
        
        setTasks(sortedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by date only
    if (filterDate) {
      filtered = filtered.filter(task => task.date === filterDate);
    }

    setFilteredTasks(filtered);
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
      const response = await apiService.updateMiniJobCard(taskId, {
        status,
        estimatedTime: undefined
      });
      if (response.status) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const clearFilters = () => {
    setFilterDate('');
  };

  const setTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setFilterDate(today);
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

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // const statusOptions: (TaskStatus | 'ALL')[] = ['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
        <div className="flex items-center space-x-4 mt-2">
          <p className="text-slate-600">Manage your assigned tasks and update their status</p>
          {getTodayTasksCount() > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Calendar className="w-3 h-3 mr-1" />
              {getTodayTasksCount()} today
            </span>
          )}
        </div>
      </div> */}

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          {/* Date Filter Only */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={setTodayFilter}
                className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Today's Tasks
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {filterDate && (
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
              <span className="text-sm text-slate-600">Active filter:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {formatDate(filterDate)}
                <button onClick={() => setFilterDate('')} className="ml-1 text-green-600 hover:text-green-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div 
            key={task.miniJobCardId} 
            className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
              isToday(task.date) ? 'border-blue-300 bg-blue-50' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isToday(task.date) ? 'bg-blue-200' : 'bg-blue-100'
                }`}>
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Task #{task.miniJobCardId.slice(-8)}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-500">Job Card Task</p>
                    {isToday(task.date) && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                        TODAY
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <StatusBadge status={task.status} />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span className={isToday(task.date) ? 'font-medium text-blue-700' : ''}>
                  {formatDate(task.date)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{task.time ? formatTime(task.time) : 'No time set'}</span>
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
            {filterDate
              ? `No tasks for ${formatDate(filterDate)}`
              : 'No tasks assigned to you'
            }
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