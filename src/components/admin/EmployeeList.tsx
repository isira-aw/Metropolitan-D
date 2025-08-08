import React from 'react';
import { User, Mail } from 'lucide-react';
import { User as UserType } from '../../types';

interface EmployeeListProps {
  employees: UserType[];
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {employee.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                  {employee.role}
                </p>
              </div>
            </div>

            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 mr-2" />
              <span>{employee.email}</span>
            </div>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 dark:text-slate-500 mb-4">
            <User className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No employees found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Employees will appear here once they register.
          </p>
        </div>
      )}
    </div>
  );
};