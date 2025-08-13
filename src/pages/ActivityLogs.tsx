import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { LogResponse, EmployeeResponse } from "../types/api";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";

// Simple Map Component for location display
const SimpleMap: React.FC<{
  latitude: number;
  longitude: number;
  address: string;
  employeeName: string;
  action: string;
}> = ({ latitude, longitude, address, employeeName, action }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  const copyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(`${latitude}, ${longitude}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy coordinates:", err);
    }
  };

  return (
    <div className="mt-3 bg-slate-800 rounded-lg overflow-hidden">
      <div className="p-4">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <span>Location Details - {action}</span>
        </h4>

        <div className="space-y-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400">Employee:</span>
                <p className="text-white font-medium">{employeeName}</p>
              </div>
              <div>
                <span className="text-slate-400">Action:</span>
                <p className="text-white font-medium">
                  {action.replace(/_/g, " ")}
                </p>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400">Address:</span>
                <p className="text-white font-medium">{address}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400">Coordinates:</span>
                <p className="text-white font-medium">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={openInGoogleMaps}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </button>

            <button
              onClick={copyCoordinates}
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                copySuccess
                  ? "bg-green-600 text-white"
                  : "bg-slate-600 hover:bg-slate-700 text-white"
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>{copySuccess ? "Copied!" : "Copy Coordinates"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Activity Log Item Component
const ActivityLogItem: React.FC<{ log: LogResponse }> = ({ log }) => {
  const [showLocation, setShowLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(false);

  const hasLocation = log.location && log.location.includes(",");
  const coordinates = hasLocation
    ? log.location.split(",").map((coord) => parseFloat(coord.trim()))
    : null;

  useEffect(() => {
    if (hasLocation && coordinates && showLocation && !locationAddress) {
      fetchLocationAddress();
    }
  }, [showLocation, hasLocation, coordinates]);

  const fetchLocationAddress = async () => {
    if (!coordinates) return;

    setLoadingAddress(true);
    try {
      const [lat, lon] = coordinates;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
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
    } finally {
      setLoadingAddress(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes("UPDATE")) return "✏️";
    if (action.includes("CREATE")) return "➕";
    if (action.includes("DELETE")) return "🗑️";
    if (action.includes("LOGIN")) return "🔐";
    return "📝";
  };

  const getActionColor = (action: string) => {
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-600";
    if (action.includes("CREATE")) return "bg-green-100 text-green-600";
    if (action.includes("DELETE")) return "bg-red-100 text-red-600";
    if (action.includes("LOGIN")) return "bg-purple-100 text-purple-600";
    return "bg-slate-100 text-slate-600";
  };

  const getStatusColor = (status: string) => {
    if (status === "SUCCESS") return "bg-green-100 text-green-700";
    if (status === "FAILED") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActionColor(
            log.action
          )}`}
        >
          {getActionIcon(log.action)}
        </div>

        {/* Main Content - All in one row */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              {/* Employee Name */}
              <span className="text-sm font-semibold text-slate-900 truncate">
                {log.employeeName}
              </span>

              {/* Action */}
              <span className="text-sm text-slate-600 truncate">
                {log.action.replace(/_/g, " ")}
              </span>

              {/* Status Badge */}
              {log.status && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    log.status
                  )}`}
                >
                  {log.status}
                </span>
              )}
              {/* Location Indicator */}
              {hasLocation && (
                <button
                  onClick={() => setShowLocation(!showLocation)}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Location</span>
                  {showLocation ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* Time */}
            <span className="text-xs text-slate-500 flex-shrink-0">
              {formatDateTime(log.date, log.time)}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Location Section */}
      {showLocation && hasLocation && coordinates && (
        <div className="mt-3 ml-11">
          {loadingAddress ? (
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading address...</span>
            </div>
          ) : (
            <SimpleMap
              latitude={coordinates[0]}
              longitude={coordinates[1]}
              address={locationAddress || "Address not available"}
              employeeName={log.employeeName}
              action={log.action}
            />
          )}
        </div>
      )}
    </div>
  );
};

export const ActivityLogs: React.FC = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<LogResponse[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [hoursFilter, setHoursFilter] = useState<number>(24);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, selectedEmployee, selectedDate, hoursFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        const [logsRes, employeesRes] = await Promise.all([
          apiService.getAllLogs(),
          apiService.getAllEmployees(),
        ]);

        if (logsRes.status && logsRes.data) {
          setLogs(logsRes.data);
        }
        if (employeesRes.status && employeesRes.data) {
          setEmployees(employeesRes.data);
        }
      } else {
        // For employees, show only their own logs
        const response = await apiService.getRecentLogs(168); // Last week
        if (response.status && response.data) {
          setLogs(response.data);
        }
      }
    } catch (error) {
      console.error("Error loading activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      let filteredData = logs;

      if (selectedEmployee && selectedDate) {
        const response = await apiService.getLogsByEmployeeAndDate(
          selectedEmployee,
          selectedDate
        );
        if (response.status && response.data) {
          filteredData = response.data;
        }
      } else if (selectedEmployee) {
        const response = await apiService.getLogsByEmployee(selectedEmployee);
        if (response.status && response.data) {
          filteredData = response.data;
        }
      } else if (selectedDate) {
        const response = await apiService.getLogsByDate(selectedDate);
        if (response.status && response.data) {
          filteredData = response.data;
        }
      } else if (hoursFilter !== 0) {
        const response = await apiService.getRecentLogs(hoursFilter);
        if (response.status && response.data) {
          filteredData = response.data;
        }
      }

      setFilteredLogs(filteredData);
    } catch (error) {
      console.error("Error applying filters:", error);
      setFilteredLogs(logs);
    }
  };

  const clearFilters = () => {
    setSelectedEmployee("");
    setSelectedDate("");
    setHoursFilter(24);
  };

  const locationLogsCount = filteredLogs.filter(
    (log) => log.location && log.location.includes(",")
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {isAdmin ? "Activity Logs" : "My Activity"}
        </h1>
        <div className="flex items-center space-x-4 mt-2">
          {/* <p className="text-slate-600">
            {isAdmin ? 'System-wide activity monitoring' : 'Your recent activity history'}
          </p> */}
          {/* {locationLogsCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <MapPin className="w-3 h-3 mr-1" />
              {locationLogsCount} with location
            </span>
          )} */}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Employees</option>
                {employees
                  .filter((employee) => employee.role !== "ADMIN")
                  .map((employee) => (
                    <option key={employee.email} value={employee.email}>
                      {employee.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Time Range
            </label>
            <select
              value={hoursFilter}
              onChange={(e) => setHoursFilter(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>Last Hour</option>
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last Week</option>
              <option value={720}>Last Month</option>
              <option value={0}>All Time</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Activity Timeline ({filteredLogs.length} entries)
            </h3>
            {locationLogsCount > 0 && (
              <div className="text-sm text-slate-500">
                Click location entries to view map details
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <ActivityLogItem key={log.logId} log={log} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No activity logs found</p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
