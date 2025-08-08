import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { User } from '../../types';
import { jobCardAPI } from '../../services/api';

interface CreateJobCardModalProps {
  employees: User[];
  onClose: () => void;
  onJobCardCreated: () => void;
}

export const CreateJobCardModal: React.FC<CreateJobCardModalProps> = ({
  // employees,
  onClose,
  onJobCardCreated,
}) => {
  const [formData, setFormData] = useState({
    jobid: '',
    generatorid: '',
    title: '',
    description: '',
    hoursnumber: 1,
    workstatus: 'Pending',
    assignto: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await jobCardAPI.create({
        ...formData,
        assignto: formData.assignto || null,
      });

      if (response.status === 'success') {
        onJobCardCreated();
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Failed to create job card:', err);
      setError('Failed to create job card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'hoursnumber' ? parseInt(value) || 0 : value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Job Card</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Job ID *
              </label>
              <input
                type="text"
                name="jobid"
                value={formData.jobid}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Enter unique job ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Generator ID *
              </label>
              <input
                type="text"
                name="generatorid"
                value={formData.generatorid}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Enter generator ID"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter job title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter job description"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Hours Required *
              </label>
              <input
                type="number"
                name="hoursnumber"
                value={formData.hoursnumber}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Work Status
              </label>
              <select
                name="workstatus"
                value={formData.workstatus}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Pending">Pending</option>
                <option value="Traveling">Traveling</option>
                <option value="Start">Start</option>
                <option value="Break">Break</option>
                <option value="End">End</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Assign to Employee (Optional)
            </label>
            <select
              name="assignto"
              value={formData.assignto}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.email}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
          </div> */}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Create Job Card</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};