import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LogResponse, EmployeeResponse } from '../types/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

export const ActivityLogs: React.FC = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<LogResponse[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
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
          apiService.getAllEmployees()
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
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      let filteredData = logs;

      if (selectedEmployee && selectedDate) {
        const response = await apiService.getLogsByEmployeeAndDate(selectedEmployee, selectedDate);
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
      console.error('Error applying filters:', error);
      setFilteredLogs(logs);
    }
  };

  const clearFilters = () => {
    setSelectedEmployee('');
    setSelectedDate('');
    setHoursFilter(24);
  };

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes('UPDATE')) return '✏️';
    if (action.includes('CREATE')) return '➕';
    if (action.includes('DELETE')) return '🗑️';
    if (action.includes('LOGIN')) return '🔐';
    return '📝';
  };

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
          {isAdmin ? 'Activity Logs' : 'My Activity'}
        </h1>
        <p className="text-slate-600 mt-2">
          {isAdmin ? 'System-wide activity monitoring' : 'Your recent activity history'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.email} value={employee.email}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Time Range</label>
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
          <h3 className="text-lg font-semibold text-slate-900">
            Activity Timeline ({filteredLogs.length} entries)
          </h3>
        </div>
        
        <div className="p-6">
          {filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.logId} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900">
                        {log.employeeName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(log.date, log.time)}
                      </p>
                    </div>
                    
                    {/* <p className="text-sm text-slate-600 mb-1">
                      {log.action.replace(/_/g, ' ').toLowerCase()}
                    </p> */}
                    
                    {log.status && (
                      <p className="text-sm text-slate-500">
                        Status: {log.status}
                      </p>
                    )}
                    
                    {log.location && (
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs text-slate-400">📍</span>
                        <p className="text-xs text-slate-500">{log.location}</p>
                      </div>
                    )}
                  </div>
                </div>
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