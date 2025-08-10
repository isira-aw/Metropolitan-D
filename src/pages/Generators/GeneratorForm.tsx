import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { generatorAPI } from '../../services/api';
import { Generator, CreateGeneratorRequest } from '../../types/api';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';

interface GeneratorFormProps {
  generator?: Generator;
  onClose: () => void;
  onSave: () => void;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ 
  generator, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<CreateGeneratorRequest>({
    name: '',
    capacity: '',
    contactNumber: '',
    email: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (generator) {
      setFormData({
        name: generator.name,
        capacity: generator.capacity,
        contactNumber: generator.contactNumber,
        email: generator.email,
        description: generator.description,
      });
    }
  }, [generator]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (generator) {
        await generatorAPI.update(generator.generatorId, formData);
      } else {
        await generatorAPI.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving generator:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {generator ? 'Edit Generator' : 'Add Generator'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Generator Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${
                errors.name 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter generator name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Capacity
            </label>
            <input
              type="text"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${
                errors.capacity 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 500KW"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capacity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${
                errors.contactNumber 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter contact number"
            />
            {errors.contactNumber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${
                errors.email 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${
                errors.description 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter generator description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{generator ? 'Update' : 'Create'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};