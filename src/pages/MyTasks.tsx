import React, { useState, useEffect } from "react";
import { format } from "date-fns-tz";
import {
  Clock,
  MapPin,
  Calendar,
  Navigation,
  X,
  Zap,
  Phone,
  Mail,
  FileText,
  Settings,
  Timer,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import {
  MiniJobCardResponse,
  TaskStatus,
  UpdateMiniJobCardRequest,
} from "../types/api";
import { StatusBadge } from "../components/UI/StatusBadge";
import { Modal } from "../components/UI/Modal";

// First, update your interface to include all the new fields
interface EnhancedMiniJobCardResponse extends MiniJobCardResponse {
  jobType?: "SERVICE" | "REPAIR";
  estimatedTime: string;
  generatorId?: string;
  generatorName?: string;
  generatorCapacity?: string;
  generatorContactNumber?: string;
  generatorEmail?: string;
  generatorDescription?: string;
}

export const MyTasks: React.FC = () => {
  const { user } = useAuth();
  const [, setTasks] = useState<EnhancedMiniJobCardResponse[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<
    EnhancedMiniJobCardResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingTask, setUpdatingTask] =
    useState<EnhancedMiniJobCardResponse | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateMiniJobCardRequest>({});

  // Location states
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);

  // Location permission states
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | "checking"
  >("checking");
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationError, setLocationError] = useState<string>("");

  useEffect(() => {
    if (user?.email) {
      loadTasks();
      checkLocationPermission();
    }
  }, [user]);

  // Modified useEffect - now calls loadTasks when filterDate changes
  useEffect(() => {
    if (user?.email) {
      loadTasks();
    }
  }, [filterDate, user?.email]);

  useEffect(() => {
    if (showUpdateModal && !currentLocation) {
      getCurrentLocation();
    }
  }, [showUpdateModal]);

  useEffect(() => {
    if (currentLocation) {
      fetchLocationAddress();
    }
  }, [currentLocation]);

  // Get current location when modal opens
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lon: longitude });
        setLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationAddress("Unable to get current location");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Fetch address when location changes
  const fetchLocationAddress = async () => {
    if (!currentLocation) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${currentLocation.lat}&lon=${currentLocation.lon}&format=json`
      );

      if (response.ok) {
        const data = await response.json();
        setLocationAddress(data.display_name || "Address not found");
      } else {
        setLocationAddress("Unable to fetch address");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setLocationAddress("Error fetching address");
    }
  };

  // Check location permission on component mount
  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        setLocationPermission(
          permission.state as "granted" | "denied" | "prompt"
        );

        permission.onchange = () => {
          setLocationPermission(
            permission.state as "granted" | "denied" | "prompt"
          );
        };
      } else {
        navigator.geolocation.getCurrentPosition(
          () => setLocationPermission("granted"),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              setLocationPermission("denied");
            } else {
              setLocationPermission("prompt");
            }
          }
        );
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
      setLocationPermission("denied");
      setLocationError("Unable to check location permission");
    }
  };

  // Request location permission
  const requestLocationPermission = async () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setLocationPermission("denied");
      setLocationLoading(false);
      return false;
    }

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lon: longitude });
          setLocationPermission("granted");
          setLocationLoading(false);
          setShowLocationAlert(false);
          resolve(true);
        },
        (error) => {
          setLocationLoading(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationPermission("denied");
              setLocationError(
                "Location access denied. Please enable location in browser settings."
              );
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError(
                "Location information unavailable. Please try again."
              );
              break;
            case error.TIMEOUT:
              setLocationError("Location request timed out. Please try again.");
              break;
            default:
              setLocationError(
                "An unknown error occurred while retrieving location."
              );
              break;
          }
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  };

  // UPDATED loadTasks function to use the new date endpoint
  const loadTasks = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      let response;

      if (filterDate) {
        // Use the new date-specific endpoint when a date is selected
        console.log(`Loading tasks for date: ${filterDate}`);
        response = await apiService.getMiniJobCardsByEmployeeAndDate(
          user.email,
          filterDate
        );
      } else {
        // Use the original endpoint for all tasks when no date filter
        console.log("Loading all tasks");
        response = await apiService.getMiniJobCardsByEmployee(user.email);
      }

      if (response.status && response.data) {
        const sortedTasks = response.data.sort((a, b) => {
          const today = new Date().toISOString().split("T")[0];
          const aDate = a.date;
          const bDate = b.date;

          const aIsToday = aDate === today;
          const bIsToday = bDate === today;

          if (aIsToday && !bIsToday) return -1;
          if (!aIsToday && bIsToday) return 1;

          return new Date(bDate).getTime() - new Date(aDate).getTime();
        });

        setTasks(sortedTasks);
        setFilteredTasks(sortedTasks);
      } else {
        // Handle case where no data or unsuccessful response
        setTasks([]);
        setFilteredTasks([]);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = (task: EnhancedMiniJobCardResponse) => {
    setUpdatingTask(task);
    setUpdateForm({
      status: task.status,
      location: task.location,
      time: task.time,
      date: task.date,
      estimatedTime: task.estimatedTime,
    });
    setShowUpdateModal(true);
    setCurrentLocation(null);
    setLocationAddress("");
  };
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = async () => {
    setIsUpdating(true);
    try {
      await handleSaveUpdate();
    } finally {
      setIsUpdating(false);
    }
  };
  const handleSaveUpdate = async () => {
    if (!updatingTask) return;

    const updatedForm = {
      ...updateForm,
      location: `${currentLocation?.lat},${currentLocation?.lon}`,
      coordinates: {
        lat: currentLocation?.lat,
        lon: currentLocation?.lon,
      },
    };
    try {
      const response = await apiService.updateMiniJobCard(
        updatingTask.miniJobCardId,
        updatedForm
      );
      if (response.status) {
        await loadTasks();
        setShowUpdateModal(false);
        setUpdatingTask(null);
        setUpdateForm({});
        setCurrentLocation(null);
        setLocationAddress("");
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const clearFilters = () => {
    setFilterDate("");
  };

  const setTodayFilter = () => {
    const today = format(new Date(), "yyyy-MM-dd", {
      timeZone: "Asia/Colombo",
    });
    setFilterDate(today);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "No time set";

    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get current time in Sri Lanka (Colombo) timezone
  const isToday = (dateString: string) => {
    const sriLankaTime = format(new Date(), "yyyy-MM-dd", {
      timeZone: "Asia/Colombo",
    });
    const taskDate = format(new Date(dateString), "yyyy-MM-dd");
    return sriLankaTime === taskDate;
  };

  const getJobTypeColor = (jobType?: string) => {
    switch (jobType) {
      case "SERVICE":
        return "bg-blue-100 text-blue-800";
      case "REPAIR":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Permission Alert */}
      {showLocationAlert && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Location Access Required
              </h3>
              <p className="text-sm text-red-700 mb-3">
                {locationError ||
                  "You need to allow location access to update tasks. Please enable location permission in your browser settings."}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    const hasPermission = await requestLocationPermission();
                    if (hasPermission) {
                      setShowLocationAlert(false);
                    }
                  }}
                  disabled={locationLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {locationLoading ? "Requesting..." : "Enable Location"}
                </button>
                <button
                  onClick={() => setShowLocationAlert(false)}
                  className="bg-white border border-red-300 text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
              <div className="mt-3 text-xs text-red-600">
                <p>
                  <strong>How to enable location:</strong>
                </p>
                <p>
                  1. Click the location icon (🗺️) in your browser's address bar
                </p>
                <p>2. Select "Allow" for location access</p>
                <p>3. Refresh the page if needed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Status Indicator */}
      {locationPermission !== "granted" && !showLocationAlert && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                <strong>Location access is required</strong> to update tasks.
                {locationPermission === "checking" &&
                  " Checking permissions..."}
                {locationPermission === "prompt" &&
                  ' Click "Update Task" to enable location access.'}
                {locationPermission === "denied" &&
                  " Location access has been denied."}
              </p>
            </div>
            {locationPermission === "denied" && (
              <button
                onClick={() => setShowLocationAlert(true)}
                className="text-yellow-700 hover:text-yellow-900 text-sm font-medium"
              >
                Fix this
              </button>
            )}
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold ml-5">My Tasks</h1>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          {/* Date Filter Only */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate("")}
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
                <button
                  onClick={() => setFilterDate("")}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-slate-600">
                {filterDate
                  ? `Loading tasks for ${formatDate(filterDate)}...`
                  : "Loading all tasks..."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div
            key={task.miniJobCardId}
            className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
              isToday(task.date)
                ? "border-blue-300 bg-blue-50"
                : "border-slate-200"
            }`}
          >
            <div className="flex justify-end mb-2">
              <StatusBadge status={task.status} />
            </div>
            {/* Task Header with Generator Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isToday(task.date) ? "bg-blue-200" : "bg-blue-100"
                  }`}
                >
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-slate-900 truncate">
                    {task.generatorName || "Generator Task"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Task #{task.miniJobCardId.slice(-8)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {task.jobType && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getJobTypeColor(
                          task.jobType
                        )}`}
                      >
                        {task.jobType}
                      </span>
                    )}
                    {isToday(task.date) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                        TODAY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {task.estimatedTime && (
              <div className="flex items-center space-x-2 text-sm text-slate-600 mb-3">
                <Timer className="w-4 h-4" />
                <span>
                  <span className="font-medium text-red-600">
                    Est. Duration:
                  </span>{" "}
                  {task.estimatedTime
                    ? `${task.estimatedTime.split(":")[0]} H ${
                        task.estimatedTime.split(":")[1]
                      } min`
                    : "No time set"}
                </span>
              </div>
            )}

            {/* Generator Details */}
            {(task.generatorCapacity || task.generatorDescription) && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Generator Details
                  </span>
                </div>
                {task.generatorCapacity && (
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="font-medium">Capacity:</span>{" "}
                    {task.generatorCapacity} KW
                  </p>
                )}
                {task.generatorDescription && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Description:</span>{" "}
                    {task.generatorDescription}
                  </p>
                )}
              </div>
            )}

            {/* Task Schedule */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span
                  className={
                    isToday(task.date) ? "font-medium text-blue-700" : ""
                  }
                >
                  {formatDate(task.date)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(task.time)}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{task.location || "No location specified"}</span>
              </div>
            </div>

            {/* Generator Contact Info */}
            {(task.generatorContactNumber || task.generatorEmail) && (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-amber-800">
                    Contact Information
                  </span>
                </div>
                {task.generatorContactNumber && (
                  <div className="flex items-center space-x-2 text-sm text-amber-700 mb-1">
                    <Phone className="w-3 h-3" />
                    <a
                      href={`tel:${task.generatorContactNumber}`}
                      className="hover:underline"
                    >
                      {task.generatorContactNumber}
                    </a>
                  </div>
                )}
                {task.generatorEmail && (
                  <div className="flex items-center space-x-2 text-sm text-amber-700">
                    <Mail className="w-3 h-3" />
                    <a
                      href={`mailto:${task.generatorEmail}`}
                      className="hover:underline"
                    >
                      {task.generatorEmail}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Action Button - Only for Today's Tasks */}
            {isToday(task.date) && (
              <div className="mb-4">
                <button
                  onClick={() => handleUpdateTask(task)}
                  disabled={locationPermission === "denied" || locationLoading}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    locationPermission === "denied"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : locationLoading
                      ? "bg-blue-400 text-white cursor-wait"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {locationLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Getting Location...</span>
                    </div>
                  ) : locationPermission === "denied" ? (
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Location Required</span>
                    </div>
                  ) : (
                    "Update Task"
                  )}
                </button>
                {locationPermission === "denied" && (
                  <p className="text-xs text-red-600 mt-1 text-center">
                    Enable location access to update tasks
                  </p>
                )}
              </div>
            )}

            {/* Task Footer */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Last updated {formatDate(task.updatedAt)}</span>
                {task.generatorId && (
                  <span className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>ID: {task.generatorId.slice(-8)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No tasks message */}
      {!loading && filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            {filterDate
              ? `No tasks found for ${formatDate(filterDate)}`
              : "No tasks assigned to you"}
          </p>
          {filterDate && (
            <button
              onClick={clearFilters}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Show all tasks
            </button>
          )}
        </div>
      )}

      {/* Enhanced Update Task Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setUpdatingTask(null);
          setUpdateForm({});
          setCurrentLocation(null);
          setLocationAddress("");
        }}
        title={`Update Task - ${
          updatingTask?.generatorName || "Generator Task"
        }`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Current Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Location
              <span className="text-xs text-slate-500 ml-1">
                (Auto-detected)
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationAddress || "Getting current location..."}
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
                Coordinates: {currentLocation.lat.toFixed(6)},{" "}
                {currentLocation.lon.toFixed(6)}
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
          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estimated Duration
            </label>
            <div className="flex gap-2">
              <select
                value={updateForm.estimatedTime?.split(":")[0] || "Hour"}
                disabled
                className="flex-1 px-3 py-2 border border-red-500 bg-red-50 text-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Hour">Hour</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")} Hour
                  </option>
                ))}
              </select>
              <span className="flex items-center text-red-600 px-2">:</span>
              <select
                value={updateForm.estimatedTime?.split(":")[1] || "Min"}
                disabled
                className="flex-1 px-3 py-2 border border-red-500 bg-red-50 text-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Min">Min</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")} Min
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date
              </label>
              <input
                type="date"
                readOnly // if need to edite remove this
                value={updateForm.date || ""}
                onChange={(e) =>
                  setUpdateForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total time you spent on this task.
              </label>
              <div className="flex gap-2">
                <select
                  value={updateForm.time?.split(":")[0] || ""}
                  onChange={(e) => {
                    const hour = e.target.value;
                    const minute = updateForm.time?.split(":")[1] || "00";
                    setUpdateForm((prev) => ({
                      ...prev,
                      time: `${hour}:${minute}`,
                    }));
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Hour</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="flex items-center text-slate-500 px-2">:</span>
                <select
                  value={updateForm.time?.split(":")[1] || ""}
                  onChange={(e) => {
                    const minute = e.target.value;
                    const hour = updateForm.time?.split(":")[0] || "00";
                    setUpdateForm((prev) => ({
                      ...prev,
                      time: `${hour}:${minute}`,
                    }));
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Min</option>
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={updateForm.status || ""}
              onChange={(e) =>
                setUpdateForm((prev) => ({
                  ...prev,
                  status: e.target.value as TaskStatus,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {/* <option value="PENDING">Pending</option> */}
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
                setLocationAddress("");
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            {/* <button
              onClick={handleSaveUpdate}
              disabled={locationLoading || !currentLocation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {locationLoading ? "Getting Location..." : "Update Task"}
            </button> */}
            <button
              onClick={handleClick}
              disabled={locationLoading || !currentLocation || isUpdating}
              className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2
        ${
          isUpdating
            ? "bg-green-600 animate-pulse"
            : locationLoading
            ? "bg-blue-400"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
            >
              {locationLoading ? (
                "Getting Location..."
              ) : isUpdating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Task"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
