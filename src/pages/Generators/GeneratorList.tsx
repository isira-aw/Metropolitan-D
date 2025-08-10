import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Zap, Mail, Phone } from 'lucide-react';
import { generatorAPI } from '../../services/api';
import { Generator } from '../../types/api';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

interface GeneratorListProps {
  onEdit: (generator: Generator) => void;
  onAdd: () => void;
}

export const GeneratorList: React.FC<GeneratorListProps> = ({ onEdit, onAdd }) => {
  const [generators, setGenerators] = useState<Generator[]>([]);
  const [filteredGenerators, setFilteredGenerators] = useState<Generator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchGenerators();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = generators.filter(gen =>
        gen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gen.capacity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gen.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGenerators(filtered);
    } else {
      setFilteredGenerators(generators);
    }
  }, [searchTerm, generators]);

  const fetchGenerators = async () => {
    try {
      const response = await generatorAPI.getAll();
      if (response.data.status) {
        setGenerators(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching generators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this generator?')) {
      return;
    }

    try {
      await generatorAPI.delete(id);
      await fetchGenerators();
    } catch (error) {
      console.error('Error deleting generator:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Generators
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your generator fleet
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Generator</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search generators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Generator Grid */}
      {filteredGenerators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerators.map((generator) => (
            <div key={generator.generatorId} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {generator.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {generator.capacity}
                    </p>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(generator)}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(generator.generatorId)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                {generator.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>{generator.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>{generator.contactNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm ? 'No generators match your search' : 'No generators found'}
          </p>
        </div>
      )}
    </div>
  );
};