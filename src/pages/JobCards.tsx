import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Calendar,
  Clock,
  Users,
  Wrench,
  Settings,
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
  const [filteredJobCards, setFilteredJobCards] = useState<JobCardResponse[]>(
    []
  );
  const [generators, setGenerators] = useState<GeneratorResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "SERVICE" | "REPAIR">(
    "ALL"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jobType, setJobType] = useState<"SERVICE" | "REPAIR">("SERVICE");
  const [formData, setFormData] = useState<CreateJobCardRequest>({
    generatorId: "",
    date: "",
    estimatedTime: "",
    employeeEmails: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterJobCards();
  }, [jobCards, filterType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobCardsRes, generatorsRes, employeesRes] = await Promise.all([
        apiService.getAllJobCards(),
        apiService.getAllGenerators(),
        apiService.getAllEmployees(),
      ]);

      if (jobCardsRes.status && jobCardsRes.data) {
        setJobCards(jobCardsRes.data);
      }
      if (generatorsRes.status && generatorsRes.data) {
        setGenerators(generatorsRes.data);
      }
      if (employeesRes.status && employeesRes.data) {
        setEmployees(employeesRes.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobCards = () => {
    if (filterType === "ALL") {
      setFilteredJobCards(jobCards);
    } else {
      setFilteredJobCards(jobCards.filter((job) => job.jobType === filterType));
    }
  };

  const handleCreateJob = async () => {
    try {
      const response =
        jobType === "SERVICE"
          ? await apiService.createServiceJob(formData)
          : await apiService.createRepairJob(formData);

      if (response.status) {
        await loadData();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating job:", error);
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
          {/* <p className="text-slate-600 mt-2">Manage service and repair jobs</p> */}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Job</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-slate-400" />
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

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobCards.map((job) => (
          <div
            key={job.jobCardId}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
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
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredJobCards.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No job cards found</p>
        </div>
      )}

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
