// components/JobCards/JobCardsFilters.tsx
import React, { useState } from "react";
import { 
  Filter, 
  Calendar, 
  X, 
  Settings, 
  Wrench, 
  MapPin,
  RotateCcw,
  ChevronDown 
} from "lucide-react";
import { JobCardResponse } from "../../types/api";

interface JobCardsFiltersProps {
  filterType: "ALL" | "SERVICE" | "REPAIR" | "VISIT";
  setFilterType: (type: "ALL" | "SERVICE" | "REPAIR" | "VISIT") => void;
  filterDate: string;
  handleDateFilterChange: (date: string) => void;
  setTodayFilter: () => Promise<void>;
  clearAllFilters: () => Promise<void>;
  dateFilterLoading: boolean;
  filteredJobCards: JobCardResponse[];
  formatDate: (dateString: string) => string;
}

export const JobCardsFilters: React.FC<JobCardsFiltersProps> = ({
  filterType,
  setFilterType,
  filterDate,
  handleDateFilterChange,
  setTodayFilter,
  clearAllFilters,
  dateFilterLoading,
  filteredJobCards,
  formatDate,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getFilterTypeDisplay = () => {
    switch (filterType) {
      case "SERVICE":
        return { label: "Service", icon: <Settings className="w-4 h-4 text-green-600" /> };
      case "REPAIR":
        return { label: "Repair", icon: <Wrench className="w-4 h-4 text-orange-600" /> };
      case "VISIT":
        return { label: "Visit", icon: <MapPin className="w-4 h-4 text-purple-600" /> };
      default:
        return { label: "All Types", icon: null };
    }
  };

  const currentFilter = getFilterTypeDisplay();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-medium text-slate-900">Filters</h3>
        </div>
        {(filterType !== "ALL" || filterDate) && (
          <button
            onClick={clearAllFilters}
            disabled={dateFilterLoading}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Job Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Job Type
          </label>
          
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-sm transition-colors"
            >
              <div className="flex items-center space-x-2">
                {currentFilter.icon}
                <span>{currentFilter.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {setFilterType("ALL"); setIsDropdownOpen(false);}}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg ${
                    filterType === "ALL" ? "bg-blue-50 text-blue-700" : "text-slate-700"
                  }`}
                >
                  <span>All Types</span>
                  {filterType === "ALL" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </button>
                
                <button
                  onClick={() => {setFilterType("SERVICE"); setIsDropdownOpen(false);}}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 ${
                    filterType === "SERVICE" ? "bg-green-50 text-green-700" : "text-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Service</span>
                  </div>
                  {filterType === "SERVICE" && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                </button>
                
                <button
                  onClick={() => {setFilterType("REPAIR"); setIsDropdownOpen(false);}}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 ${
                    filterType === "REPAIR" ? "bg-orange-50 text-orange-700" : "text-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-4 h-4" />
                    <span>Repair</span>
                  </div>
                  {filterType === "REPAIR" && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
                </button>
                
                <button
                  onClick={() => {setFilterType("VISIT"); setIsDropdownOpen(false);}}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 last:rounded-b-lg ${
                    filterType === "VISIT" ? "bg-purple-50 text-purple-700" : "text-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Visit</span>
                  </div>
                  {filterType === "VISIT" && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Filter by Date
          </label>
          <div className="space-y-2">
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => handleDateFilterChange(e.target.value)}
                disabled={dateFilterLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
              {filterDate && (
                <button
                  onClick={() => handleDateFilterChange("")}
                  disabled={dateFilterLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  title="Clear date filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <button
              onClick={setTodayFilter}
              disabled={dateFilterLoading}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="w-4 h-4" />
              <span>Today</span>
            </button>
          </div>
        </div>

        {/* Results Summary - Compact */}
        <div className="md:col-span-1 lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Results
          </label>
          <div className="bg-slate-50 rounded-lg p-3 h-[76px] flex items-center">
            <div>
              <div className="text-xl font-bold text-slate-900">
                {filteredJobCards.length}
              </div>
              <div className="text-xs text-slate-600">
                {filteredJobCards.length === 1 ? "job card" : "job cards"}
                {filterDate && ` on ${formatDate(filterDate)}`}
                {filterType !== "ALL" && ` (${filterType.toLowerCase()})`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display - Compact */}
      {(filterType !== "ALL" || filterDate) && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-600">Active:</span>
            {filterType !== "ALL" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filterType}
                <button
                  onClick={() => setFilterType("ALL")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  title="Remove filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterDate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {formatDate(filterDate)}
                <button
                  onClick={() => handleDateFilterChange("")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  title="Remove filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};