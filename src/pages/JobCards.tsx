import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Calendar,
  Clock,
  Users,
  Wrench,
  Settings,
  Trash2,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { apiService } from "../services/api";
import {
  JobCardResponse,
  GeneratorResponse,
  EmployeeResponse,
  CreateJobCardRequest,
} from "../types/api";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import { Modal } from "../components/UI/Modal";

export const JobCards: React.FC = () => {
  const [jobCards, setJobCards] = useState<JobCardResponse[]>([]);
  const [filteredJobCards, setFilteredJobCards] = useState<JobCardResponse[]>([]);
  const [generators, setGenerators] = useState<GeneratorResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "SERVICE" | "REPAIR">("ALL");
  const [filterDate, setFilterDate] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobCardResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [jobType, setJobType] = useState<"SERVICE" | "REPAIR">("SERVICE");
  const [formData, setFormData] = useState<CreateJobCardRequest>({
    generatorId: "",
    date: "",
    estimatedTime: "",
    employeeEmails: [],
  });
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dateFilterLoading, setDateFilterLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Apply job type filtering on the current job cards
    filterByJobType();
  }, [jobCards, filterType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [generatorsRes, employeesRes] = await Promise.all([
        apiService.getAllGenerators(),
        apiService.getAllEmployees(),
      ]);

      if (generatorsRes.status && generatorsRes.data) {
        setGenerators(generatorsRes.data);
      }
      if (employeesRes.status && employeesRes.data) {
        setEmployees(employeesRes.data);
      }

      // Load all job cards initially
      await loadAllJobCards();
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllJobCards = async () => {
    try {
      const jobCardsRes = await apiService.getAllJobCards();
      if (jobCardsRes.status && jobCardsRes.data) {
        setJobCards(jobCardsRes.data);
      }
    } catch (error) {
      console.error("Error loading job cards:", error);
    }
  };

  const loadJobCardsByDate = async (date: string) => {
    try {
      setDateFilterLoading(true);
      const jobCardsRes = await apiService.getJobCardsByDate(date);
      if (jobCardsRes.status && jobCardsRes.data) {
        setJobCards(jobCardsRes.data);
      }
    } catch (error) {
      console.error("Error loading job cards by date:", error);
    } finally {
      setDateFilterLoading(false);
    }
  };

  const filterByJobType = () => {
    let filtered = jobCards;

    // Filter by job type
    if (filterType !== "ALL") {
      filtered = filtered.filter((job) => job.jobType === filterType);
    }

    setFilteredJobCards(filtered);
  };

  const handleDateFilterChange = async (date: string) => {
    setFilterDate(date);
    
    if (date) {
      // Load job cards for specific date from backend
      await loadJobCardsByDate(date);
    } else {
      // Load all job cards when date filter is cleared
      await loadAllJobCards();
    }
  };

  const handleCreateJob = async () => {
    try {
      const response =
        jobType === "SERVICE"
          ? await apiService.createServiceJob(formData)
          : await apiService.createRepairJob(formData);

      if (response.status) {
        // Refresh based on current filters
        if (filterDate) {
          await loadJobCardsByDate(filterDate);
        } else {
          await loadAllJobCards();
        }
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      setDeleting(true);
      const response = await apiService.deleteJobCard(jobToDelete.jobCardId);
      
      if (response.status) {
        // Refresh based on current filters
        if (filterDate) {
          await loadJobCardsByDate(filterDate);
        } else {
          await loadAllJobCards();
        }
        setShowDeleteModal(false);
        setJobToDelete(null);
      } else {
        alert("Failed to delete job card: " + (response.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job card. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      generatorId: "",
      date: "",
      estimatedTime: "",
      employeeEmails: [],
    });
  };

  const handleEmployeeToggle = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      employeeEmails: prev.employeeEmails.includes(email)
        ? prev.employeeEmails.filter((e) => e !== email)
        : [...prev.employeeEmails, email].slice(0, 5), // Max 5 employees
    }));
  };

  const clearAllFilters = async () => {
    setFilterType("ALL");
    setFilterDate("");
    await loadAllJobCards();
  };

  const setTodayFilter = async () => {
    const today = new Date().toISOString().split("T")[0];
    setFilterDate(today);
    await loadJobCardsByDate(today);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDeleteModal = (job: JobCardResponse) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
    setShowDropdown(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Job Cards</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Job</span>
        </button>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          {/* Job Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Job Type</label>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="flex space-x-2">
                {["ALL", "SERVICE", "REPAIR"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFilterType(type as "ALL" | "SERVICE" | "REPAIR")
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === type
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  disabled={dateFilterLoading}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                {dateFilterLoading && (
                  <div className="absolute inset-y-0 right-8 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {filterDate && !dateFilterLoading && (
                  <button
                    onClick={() => handleDateFilterChange("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title="Clear date filter"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={setTodayFilter}
                disabled={dateFilterLoading}
                className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                {dateFilterLoading ? "Loading..." : "Today's Jobs"}
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearAllFilters}
                disabled={dateFilterLoading}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                Clear All Filters
              </button>
            </div>

            <div className="flex items-end justify-end">
              <div className="text-sm text-slate-500">
                {filteredJobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''}
                {filterDate && (
                  <span className="block text-xs text-green-600">
                    for {formatDate(filterDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filterType !== "ALL" || filterDate) && (
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
              <span className="text-sm text-slate-600">Active filters:</span>
              {filterType !== "ALL" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {filterType}
                  <button 
                    onClick={() => setFilterType("ALL")} 
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    title="Remove job type filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterDate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {formatDate(filterDate)}
                  <button 
                    onClick={() => handleDateFilterChange("")} 
                    className="ml-1 text-green-600 hover:text-green-800"
                    title="Remove date filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading state for date filtering */}
      {dateFilterLoading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-slate-600">Loading job cards...</span>
        </div>
      )}

      {/* Job Cards Grid */}
      {!dateFilterLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobCards.map((job) => (
            <div
              key={job.jobCardId}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow relative"
            >
              {/* Actions Dropdown */}
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(showDropdown === job.jobCardId ? null : job.jobCardId);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="More actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showDropdown === job.jobCardId && (
                    <div 
                      className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openDeleteModal(job)}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Job Card</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start justify-between mb-4 pr-8">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      job.jobType === "SERVICE" ? "bg-green-100" : "bg-orange-100"
                    }`}
                  >
                    {job.jobType === "SERVICE" ? (
                      <Settings
                        className={`w-6 h-6 ${
                          job.jobType === "SERVICE"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      />
                    ) : (
                      <Wrench
                        className={`w-6 h-6 ${
                          job.jobType === "SERVICE"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {job.generator.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {job.generator.capacity} KW
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.jobType === "SERVICE"
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {job.jobType}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(job.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(job.estimatedTime)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{job.assignedEmployees.length} employees assigned</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Assigned Employees:
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.assignedEmployees.map((employee) => (
                    <span
                      key={employee.email}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {employee.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Created {formatDate(job.createdAt)}
                  {job.updatedAt !== job.createdAt && (
                    <span className="block">
                      Updated {formatDate(job.updatedAt)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!dateFilterLoading && filteredJobCards.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            {filterDate && filterType !== "ALL"
              ? `No ${filterType.toLowerCase()} job cards for ${formatDate(filterDate)}`
              : filterDate
              ? `No job cards for ${formatDate(filterDate)}`
              : filterType !== "ALL"
              ? `No ${filterType.toLowerCase()} job cards found`
              : "No job cards found"
            }
          </p>
          {(filterType !== "ALL" || filterDate) && (
            <button
              onClick={clearAllFilters}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setJobToDelete(null);
        }}
        title="Delete Job Card"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Are you sure you want to delete this job card?
              </h3>
              {jobToDelete && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Generator:</span> {jobToDelete.generator.name}</p>
                    <p><span className="font-medium">Type:</span> {jobToDelete.jobType}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(jobToDelete.date)}</p>
                    <p><span className="font-medium">Employees:</span> {jobToDelete.assignedEmployees.length} assigned</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-slate-600">
                This action cannot be undone. This will permanently delete the job card and all related mini job card tasks assigned to employees.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setJobToDelete(null);
              }}
              disabled={deleting}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteJob}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Job Card</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Job Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Job Card"
        size="lg"
      >
        <div className="space-y-6">
          {/* Job Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Job Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setJobType("SERVICE")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  jobType === "SERVICE"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Service</span>
              </button>
              <button
                onClick={() => setJobType("REPAIR")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                  jobType === "REPAIR"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Wrench className="w-5 h-5" />
                <span>Repair</span>
              </button>
            </div>
          </div>

          {/* Generator Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Generator
            </label>
            <select
              value={formData.generatorId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  generatorId: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a generator</option>
              {generators.map((generator) => (
                <option
                  key={generator.generatorId}
                  value={generator.generatorId}
                >
                  {generator.name} - {generator.capacity}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estimated Time
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.estimatedTime.split(":")[0] || ""}
                  onChange={(e) => {
                    const hour = e.target.value;
                    const minute = formData.estimatedTime.split(":")[1] || "00";
                    setFormData((prev) => ({
                      ...prev,
                      estimatedTime: `${hour}:${minute}`,
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
                  value={formData.estimatedTime.split(":")[1] || ""}
                  onChange={(e) => {
                    const minute = e.target.value;
                    const hour = formData.estimatedTime.split(":")[0] || "00";
                    setFormData((prev) => ({
                      ...prev,
                      estimatedTime: `${hour}:${minute}`,
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

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign Employees (max 5) - {formData.employeeEmails.length}{" "}
              selected
            </label>
            <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-3 space-y-2">
              {employees.map((employee) => (
                <label
                  key={employee.email}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.employeeEmails.includes(employee.email)}
                    onChange={() => handleEmployeeToggle(employee.email)}
                    disabled={
                      !formData.employeeEmails.includes(employee.email) &&
                      formData.employeeEmails.length >= 5
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {employee.name}
                    </p>
                    <p className="text-xs text-slate-500">{employee.email}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      employee.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {employee.role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateJob}
              disabled={
                !formData.generatorId ||
                !formData.date ||
                !formData.estimatedTime ||
                formData.employeeEmails.length === 0
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
            >
              Create Job Card
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};