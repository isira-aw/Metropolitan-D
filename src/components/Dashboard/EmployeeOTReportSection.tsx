// File: src/components/Dashboard/EmployeeOTReportSection.tsx

import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { apiService } from "../../services/api";
import {
  EmployeeResponse,
  OTReportRequest,
  OTRecord,
} from "../../types/api";
import { LoadingSpinner } from "../UI/LoadingSpinner";

interface EmployeeOTReportSectionProps {
  employees: EmployeeResponse[];
}

interface OTReportData {
  employeeEmail: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  otRecords: OTRecord[];
  totalMorningOT: string;
  totalEveningOT: string;
  totalOT: string;
  totalOnHoldTime: string;
  totalAssignedTime: string;
  totalInProgressTime: string;
}

// Updated OTRecord interface to match new response
interface ExtendedOTRecord extends OTRecord {
  onHoldTime: string;
  assignedTime: string;
  inProgressTime: string;
  currentStatus: string;
  lastStatus: string;
}

export const EmployeeOTReportSection: React.FC<EmployeeOTReportSectionProps> = ({
  employees,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportData, setReportData] = useState<OTReportData | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(lastMonth.toISOString().split("T")[0]);
  }, []);

  const generateOTReport = async (): Promise<void> => {
    if (!selectedEmployee || !startDate || !endDate) {
      setReportError("Please select employee and date range");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setReportError("Start date cannot be after end date");
      return;
    }

    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24));
    if (daysDiff > 31) {
      setReportError("Maximum report period is 31 days");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      const request: OTReportRequest = {
        employeeEmail: selectedEmployee,
        startDate,
        endDate,
      };

      const response = await apiService.generateEmployeeOTReport(request);
      console.log("Raw OT API Response:", response);

      // Handle the response - it could be wrapped or direct
      let data: OTReportData | null = null;
      
      if (response && response.data) {
        data = response.data;
      } else if (response && response.employeeEmail) {
        data = response as unknown as OTReportData;
      }

      if (data && data.employeeEmail) {
        setReportData(data);
        console.log("OT Report data loaded:", data);
      } else {
        setReportError("No data received from server");
        console.error("Invalid response structure:", response);
      }
    } catch (error) {
      console.error("OT API Error:", error);
      setReportError("Failed to generate OT report. Check console for details.");
    } finally {
      setReportLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatTime = (timeString: string): string => {
    if (!timeString || timeString === "00:00") return "00:00:00";
    // Handle both HH:MM and HH:MM:SS formats
    const parts = timeString.split(":");
    if (parts.length === 2) {
      return `${timeString}:00`;
    }
    return timeString;
  };

  // Function to open Google Maps with coordinates
  const openGoogleMaps = (coordinates: string): void => {
    if (!coordinates) return;
    
    // Extract lat,lng from coordinates string
    const coords = coordinates.split(',');
    if (coords.length >= 2) {
      const lat = coords[0].trim();
      const lng = coords[1].trim();
      const mapsUrl = `https://www.google.com/maps/dir/${lat},${lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  // Function to format coordinates for display
  const formatCoordinates = (coordinates: string): string => {
    if (!coordinates) return "N/A";
    const coords = coordinates.split(',');
    if (coords.length >= 2) {
      const lat = parseFloat(coords[0]).toFixed(6);
      const lng = parseFloat(coords[1]).toFixed(6);
      return `${lat}, ${lng}`;
    }
    return coordinates;
  };

  const parseTimeToMinutes = (timeString: string): number => {
    if (!timeString) return 0;
    const parts = timeString.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;
    return (hours * 60) + minutes + (seconds / 60);
  };

  const formatMinutesToHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Clock className="h-5 w-5 text-orange-600 mr-2" />
        <h3 className="text-lg font-semibold text-slate-900">
          Employee Overtime Report
        </h3>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <User className="h-4 w-4 inline mr-1" />
            Employee
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          >
            <option value="">Select Employee</option>
            {employees
              .filter((emp) => emp.role !== "ADMIN")
              .map((emp) => (
                <option key={emp.email} value={emp.email}>
                  {emp.name} ({emp.email})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={generateOTReport}
            disabled={reportLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 text-sm"
          >
            {reportLoading ? <LoadingSpinner size="sm" /> : <Clock className="h-4 w-4 mr-2" />}
            {reportLoading ? "Loading..." : "Generate OT Report"}
          </button>
        </div>
      </div>

      {/* Error */}
      {reportError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-700 text-sm">{reportError}</span>
          <button
            onClick={() => {setReportError(""); setReportData(null);}}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900">
              Overtime Report - {reportData.employeeName}
            </h4>
            <p className="text-sm text-slate-600">
              {formatDate(reportData.startDate)} to {formatDate(reportData.endDate)} • {reportData.otRecords?.length || 0} days with OT
            </p>
          </div>

          {/* Summary Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Morning OT</p>
                  <p className="text-lg font-bold text-blue-900">
                    {formatTime(reportData.totalMorningOT)}
                  </p>
                  <p className="text-xs text-blue-600">
                    {formatMinutesToHours(parseTimeToMinutes(reportData.totalMorningOT))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">Evening OT</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatTime(reportData.totalEveningOT)}
                  </p>
                  <p className="text-xs text-green-600">
                    {formatMinutesToHours(parseTimeToMinutes(reportData.totalEveningOT))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Total OT</p>
                  <p className="text-lg font-bold text-orange-900">
                    {formatTime(reportData.totalOT)}
                  </p>
                  <p className="text-xs text-orange-600">
                    {formatMinutesToHours(parseTimeToMinutes(reportData.totalOT))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">On Hold</p>
                  <p className="text-lg font-bold text-yellow-900">
                    {formatTime(reportData.totalOnHoldTime)}
                  </p>
                  <p className="text-xs text-yellow-600">
                    {formatMinutesToHours(parseTimeToMinutes(reportData.totalOnHoldTime))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Assigned</p>
                  <p className="text-lg font-bold text-purple-900">
                    {formatTime(reportData.totalAssignedTime)}
                  </p>
                  <p className="text-xs text-purple-600">
                    {formatMinutesToHours(parseTimeToMinutes(reportData.totalAssignedTime))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">In Progress</p>
                  <p className="text-lg font-bold text-indigo-900">
                    {formatTime(reportData.totalInProgressTime)}
                  </p>
                  <p className="text-xs text-indigo-600">
                    {formatMinutesToHours(parseTimeToMinutes(reportData.totalInProgressTime))}
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-slate-200 rounded-lg">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">First Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Last Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">First Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Last Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Morning OT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Evening OT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Daily Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">On Hold</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Assigned</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">In Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.otRecords && reportData.otRecords.length > 0 ? (
                  reportData.otRecords.map((record: ExtendedOTRecord, index) => (
                    <tr key={`${record.date}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-slate-900">
                        {formatTime(record.firstTime)}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-slate-900">
                        {formatTime(record.lastTime)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900">
                        {record.firstLocation && (
                          <button
                            onClick={() => openGoogleMaps(record.firstLocation)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline"
                            title={formatCoordinates(record.firstLocation)}
                          >
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">View Map</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900">
                        {record.lastLocation && record.firstLocation !== record.lastLocation && (
                          <button
                            onClick={() => openGoogleMaps(record.lastLocation)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline"
                            title={formatCoordinates(record.lastLocation)}
                          >
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">View Map</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                        {record.firstLocation === record.lastLocation && (
                          <span className="text-xs text-slate-400">Same location</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-blue-700">
                        {formatTime(record.morningOT)}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-green-700">
                        {formatTime(record.eveningOT)}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono font-medium text-orange-700">
                        {formatTime(record.dailyTotalOT)}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-yellow-700">
                        {formatTime(record.onHoldTime)}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-purple-700">
                        {formatTime(record.assignedTime)}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-indigo-700">
                        {formatTime(record.inProgressTime)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900">
                        <div className="flex flex-col space-y-1">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                            {record.currentStatus}
                          </span>
                          {record.lastStatus && record.lastStatus !== record.currentStatus && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              Prev: {record.lastStatus}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                      No overtime records found for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};