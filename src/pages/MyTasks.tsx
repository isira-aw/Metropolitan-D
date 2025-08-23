import React, { useState, useEffect } from "react";
import { format } from "date-fns-tz";
import { Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import {
  MiniJobCardResponse,
  UpdateMiniJobCardRequest,
} from "../types/api";
import { LocationManager } from "../components/MyTasks/LocationManager";
import { TasksDisplay } from "../components/MyTasks/TasksDisplay";


// Enhanced interface
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

// Location context type
interface LocationState {
  lat: number;
  lon: number;
}

interface LocationContextType {
  currentLocation: LocationState | null;
  locationAddress: string;
  locationLoading: boolean;
  locationPermission: "granted" | "denied" | "prompt" | "checking";
  locationError: string;
  showLocationAlert: boolean;
  getCurrentLocation: () => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
  setShowLocationAlert: (show: boolean) => void;
}

export const MyTasks: React.FC = () => {
  const { user } = useAuth();
  const [, setTasks] = useState<EnhancedMiniJobCardResponse[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<EnhancedMiniJobCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingTask, setUpdatingTask] = useState<EnhancedMiniJobCardResponse | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateMiniJobCardRequest>({});

  // Location states
  const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | "checking"
  >("checking");
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadTasks();
    }
  }, [user, filterDate]);

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

  // Location functions
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
        maximumAge: 300000,
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
        setLocationAddress(data.display_name || "Address not found");
      } else {
        setLocationAddress("Unable to fetch address");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setLocationAddress("Error fetching address");
    }
  };

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

  // Initialize location permission check
  useEffect(() => {
    if (user?.email) {
      checkLocationPermission();
    }
  }, [user]);

  // Task management functions
  const loadTasks = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      let response;

      if (filterDate) {
        console.log(`Loading tasks for date: ${filterDate}`);
        response = await apiService.getMiniJobCardsByEmployeeAndDate(
          user.email,
          filterDate
        );
      } else {
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

  const handleSaveUpdate = async () => {
    if (!updatingTask || !currentLocation) return;

    setIsUpdating(true);
    
    const updatedForm = {
      ...updateForm,
      location: `${currentLocation.lat},${currentLocation.lon}`,
      coordinates: {
        lat: currentLocation.lat,
        lon: currentLocation.lon,
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
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter functions
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

  // Create location context value
  const locationContext: LocationContextType = {
    currentLocation,
    locationAddress,
    locationLoading,
    locationPermission,
    locationError,
    showLocationAlert,
    getCurrentLocation,
    requestLocationPermission,
    setShowLocationAlert,
  };

  return (
    <div className="space-y-6">
      {/* Location Management Component */}
      <LocationManager locationContext={locationContext} />
      
      <h1 className="text-2xl font-bold ml-5">My Tasks</h1>

      {/* Tasks Display Component (includes filters, grid, and modal) */}
      <TasksDisplay
        tasks={filteredTasks}
        loading={loading}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        setTodayFilter={setTodayFilter}
        clearFilters={clearFilters}
        formatDate={formatDate}
        showUpdateModal={showUpdateModal}
        setShowUpdateModal={setShowUpdateModal}
        updatingTask={updatingTask}
        setUpdatingTask={setUpdatingTask}
        updateForm={updateForm}
        setUpdateForm={setUpdateForm}
        locationContext={locationContext}
        onUpdateTask={handleUpdateTask}
        onSaveUpdate={handleSaveUpdate}
        isUpdating={isUpdating}
      />

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
    </div>
  );
};