import React, { useState, useEffect } from "react";
import {
  Users,
  Zap,
  ClipboardList,
  CheckSquare,
  Search,
  Calendar,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import {
  MiniJobCardResponse,
  LogResponse,
  EmployeeResponse,
  ReportDataResponse,
} from "../types/api";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { StatusBadge } from "../components/UI/StatusBadge";

interface DashboardStats {
  totalEmployees: number;
  totalGenerators: number;
  todayJobCards: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalGenerators: 0,
    todayJobCards: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<MiniJobCardResponse[]>([]);
  const [recentActivity, setRecentActivity] = useState<LogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Report table state
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportData, setReportData] = useState<ReportDataResponse[]>([]);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string>("");

  useEffect(() => {
    loadDashboardData();
    setDefaultDates();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Load admin dashboard data
      const [employeesRes, generatorsRes, todayJobCardsRes, tasksRes, logsRes] =
        await Promise.all([
          apiService.getAllEmployees(),
          apiService.getAllGenerators(),
          apiService.getJobCardsByDate(today),
          apiService.getAllMiniJobCards(),
          apiService.getRecentLogs(24),
        ]);

      if (
        employeesRes.status &&
        generatorsRes.status &&
        todayJobCardsRes.status &&
        tasksRes.status
      ) {
        const tasks = tasksRes.data || [];
        setStats({
          totalEmployees: employeesRes.data?.length || 0,
          totalGenerators: generatorsRes.data?.length || 0,
          todayJobCards: todayJobCardsRes.data?.length || 0,
          totalTasks: tasks.length,
          pendingTasks: tasks.filter(
            (t) => t.status === "PENDING" || t.status === "ASSIGNED"
          ).length,
          completedTasks: tasks.filter((t) => t.status === "COMPLETED").length,
        });
        setRecentTasks(tasks.slice(0, 6));
      }

      if (logsRes.status) {
        setRecentActivity(logsRes.data?.slice(0, 10) || []);
      }

      // Load employees for report dropdown
      if (employeesRes.status && employeesRes.data) {
        setEmployees(employeesRes.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Set default dates (last 7 days)
  const setDefaultDates = (): void => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(lastWeek.toISOString().split("T")[0]);
  };

  // Generate report table
  const generateReportTable = async (): Promise<void> => {
    if (!selectedEmployee || !startDate || !endDate) {
      setReportError("Please select employee and date range");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setReportError("Start date cannot be after end date");
      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      console.log("Generating report for:", {
        selectedEmployee,
        startDate,
        endDate,
      });

      const response = await apiService.previewReportData({
        email: selectedEmployee,
        startDate,
        endDate,
      });

      console.log("API Response:", response);

      // Handle different response structures
      let dataToSet: ReportDataResponse[] = [];

      if (Array.isArray(response)) {
        // API returns array directly
        dataToSet = response;
      } else if (response.data && Array.isArray(response.data)) {
        // API returns { status: true, data: [...] }
        dataToSet = response.data;
      // eslint-disable-next-line no-dupe-else-if
      } else if (response.status && response.data && Array.isArray(response.data)) {
        // API returns { status: true, data: [...] }
        dataToSet = response.data;
      }

      if (dataToSet.length > 0) {
        setReportData(dataToSet);
        console.log("Report data set successfully:", dataToSet);
      } else {
        setReportError("No data available for selected criteria");
      }
    } catch (error) {
      console.error("Catch Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setReportError(`Network error: ${errorMessage}`);
    } finally {
      setReportLoading(false);
    }
  };

  const formatTime = (hours: number | null | undefined): string => {
    if (!hours || hours === 0) return "0.00";
    return parseFloat(hours.toString()).toFixed(2);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const clearReportError = (): void => setReportError("");

  const getEmployeeName = (): string => {
    const employee = employees.find((emp) => emp.email === selectedEmployee);
    return employee ? employee.name : selectedEmployee;
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
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Generators",
      value: stats.totalGenerators,
      icon: Zap,
      color: "bg-yellow-500",
    },
    {
      title: "Today Job Cards",
      value: stats.todayJobCards,
      icon: ClipboardList,
      color: "bg-green-500",
    },
    {
      title: "Today Tasks",
      value: stats.totalTasks,
      icon: CheckSquare,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 ml-4">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {card.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Generation Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center mb-6">
          <Search className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-slate-900">
            Employee Work Report
          </h2>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select Employee</option>
              {employees
                .filter((employee) => employee.role !== "ADMIN")
                .map((employee) => (
                  <option key={employee.email} value={employee.email}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={generateReportTable}
              disabled={reportLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {reportLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {reportLoading ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {reportError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-red-700 text-sm">{reportError}</span>
            <button
              onClick={clearReportError}
              className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Report Table */}
        {reportData.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Work Report - {getEmployeeName()}
              </h3>
              <div className="text-sm text-slate-600">
                {formatDate(startDate)} to {formatDate(endDate)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Generator Names
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      First Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Last Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Working Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Morning OT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Evening OT
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {reportData.map((day, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {formatDate(day.date)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900">
                        <span
                          className="truncate max-w-xs block"
                          title={day.generatorNames}
                        >
                          {day.generatorNames || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900">
                        <span
                          className="truncate max-w-xs block"
                          title={day.firstActionLocation}
                        >
                          {day.firstActionLocation || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900">
                        <span
                          className="truncate max-w-xs block"
                          title={day.lastActionLocation}
                        >
                          {day.lastActionLocation || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            day.fullWorkingTime > 8
                              ? "bg-green-100 text-green-800"
                              : day.fullWorkingTime > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {formatTime(day.fullWorkingTime)} hrs
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            day.morningOTTime > 0
                              ? "bg-orange-100 text-orange-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {formatTime(day.morningOTTime)} hrs
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            day.eveningOTTime > 0
                              ? "bg-orange-100 text-orange-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {formatTime(day.eveningOTTime)} hrs
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {reportData.length === 0 &&
          selectedEmployee &&
          startDate &&
          endDate &&
          !reportLoading &&
          !reportError && (
            <div className="text-center text-slate-500 py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg">No data found</p>
              <p className="text-sm">
                No work data found for the selected date range.
              </p>
              <button
                onClick={() =>
                  console.log("Debug info:", {
                    selectedEmployee,
                    startDate,
                    endDate,
                    reportData,
                  })
                }
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Debug Info (Check Console)
              </button>
            </div>
          )}

        {/* Debug Info Panel */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <strong>Debug:</strong> Employee: {selectedEmployee || "None"} |
          Start: {startDate || "None"} | End: {endDate || "None"} | Data Count:{" "}
          {reportData.length} | Loading: {reportLoading ? "Yes" : "No"} | Error:{" "}
          {reportError || "None"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Tasks
          </h3>

          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div
                  key={task.miniJobCardId}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  {/* Left Section */}
                  <div className="flex items-start gap-3">
                    {/* Status Dot */}
                    <div className="w-2.5 h-2.5 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>

                    {/* Task Details */}
                    <div>
                      <p className="font-medium text-slate-900">
                        {task.employeeName}
                      </p>
                      <p className="text-sm text-slate-700">
                        {task.generatorName}
                      </p>
                      <p className="text-sm text-slate-600">{task.location}</p>
                      <p className="text-xs text-slate-500">
                        {task.date} at {task.time}
                      </p>
                    </div>
                  </div>

                  {/* Right Section: Status Badge */}
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
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Activity
          </h3>

          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div
                  key={log.logId}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  {/* Timeline Dot */}
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {log.generatorName}
                    </p>

                    <p className="text-sm text-slate-700">
                      Employee:{" "}
                      <span className="font-medium text-slate-900">
                        {log.employeeName}
                      </span>
                    </p>

                    <p className="text-xs text-blue-600 font-medium">
                      {log.status}
                    </p>

                    <p className="text-xs text-slate-500">
                      {log.date} at {log.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
