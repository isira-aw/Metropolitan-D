// File: src/components/Dashboard/EmployeeOTReportSection.tsx

import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Clock,
  MapPin,
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
    if (!timeString) return "00:00:00";
    return timeString;
  };

  // const parseTimeToMinutes = (timeString: string): number => {
  //   if (!timeString) return 0;
  //   const [hours, minutes, seconds] = timeString.split(':').map(Number);
  //   return (hours * 60) + minutes + (seconds / 60);
  // };

  // const formatMinutesToHours = (minutes: number): string => {
  //   const hours = Math.floor(minutes / 60);
  //   const mins = Math.floor(minutes % 60);
  //   return `${hours}h ${mins}m`;
  // };

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
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div> */}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-slate-200 rounded-lg">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">First Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Last Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Locations</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Morning OT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Evening OT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase border-b">Daily Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.otRecords && reportData.otRecords.length > 0 ? (
                  reportData.otRecords.map((record, index) => (
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
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 text-slate-400 mr-1" />
                            <span className="text-xs">{record.firstLocation}</span>
                          </div>
                          {record.firstLocation !== record.lastLocation && (
                            <>
                              <span className="text-slate-400">→</span>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 text-slate-400 mr-1" />
                                <span className="text-xs">{record.lastLocation}</span>
                              </div>
                            </>
                          )}
                        </div>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
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