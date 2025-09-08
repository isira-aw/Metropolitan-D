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
import { format } from "date-fns-tz";
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

  // Fixed Today function that uses proper Sri Lanka timezone
  const handleTodayClick = () => {
    const today = format(new Date(), "yyyy-MM-dd", {
      timeZone: "Asia/Colombo",
    });
    handleDateFilterChange(today);
  };

  const currentFilter = getFilterTypeDisplay();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-900">Filters</h3>
          <span className="text-xs text-slate-500">
            ({filteredJobCards.length} {filteredJobCards.length === 1 ? "result" : "results"})
          </span>
        </div>
        {(filterType !== "ALL" || filterDate) && (
          <button
            onClick={clearAllFilters}
            disabled={dateFilterLoading}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Compact Inline Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Job Type Dropdown - Compact */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between px-3 py-1.5 rounded border border-slate-300 hover:border-slate-400 bg-white text-xs transition-colors min-w-[100px]"
          >
            <div className="flex items-center space-x-1">
              {currentFilter.icon}
              <span>{currentFilter.label}</span>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-500 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-20 min-w-[120px]">
              <button
                onClick={() => {setFilterType("ALL"); setIsDropdownOpen(false);}}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-slate-50 first:rounded-t ${
                  filterType === "ALL" ? "bg-blue-50 text-blue-700" : "text-slate-700"
                }`}
              >
                <span>All Types</span>
                {filterType === "ALL" && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
              </button>
              
              <button
                onClick={() => {setFilterType("SERVICE"); setIsDropdownOpen(false);}}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-slate-50 ${
                  filterType === "SERVICE" ? "bg-green-50 text-green-700" : "text-slate-700"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Settings className="w-3 h-3" />
                  <span>Service</span>
                </div>
                {filterType === "SERVICE" && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
              </button>
              
              <button
                onClick={() => {setFilterType("REPAIR"); setIsDropdownOpen(false);}}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-slate-50 ${
                  filterType === "REPAIR" ? "bg-orange-50 text-orange-700" : "text-slate-700"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Wrench className="w-3 h-3" />
                  <span>Repair</span>
                </div>
                {filterType === "REPAIR" && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>}
              </button>
              
              <button
                onClick={() => {setFilterType("VISIT"); setIsDropdownOpen(false);}}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-slate-50 last:rounded-b ${
                  filterType === "VISIT" ? "bg-purple-50 text-purple-700" : "text-slate-700"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>Visit</span>
                </div>
                {filterType === "VISIT" && <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>}
              </button>
            </div>
          )}
        </div>

        {/* Date Input - Compact */}
        <div className="relative">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => handleDateFilterChange(e.target.value)}
            disabled={dateFilterLoading}
            className="px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-xs w-[140px]"
          />
          {filterDate && (
            <button
              onClick={() => handleDateFilterChange("")}
              disabled={dateFilterLoading}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
              title="Clear date"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        
        {/* Today Button - Fixed */}
        <button
          onClick={handleTodayClick}
          disabled={dateFilterLoading}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-slate-300 rounded hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calendar className="w-3 h-3" />
          <span>Today</span>
        </button>

        {/* Loading Indicator */}
        {dateFilterLoading && (
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-slate-400"></div>
            <span>Loading...</span>
          </div>
        )}
      </div>

      {/* Active Filters Display - Compact Inline */}
      {(filterType !== "ALL" || filterDate) && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center flex-wrap gap-1">
            <span className="text-xs text-slate-500">Active:</span>
            {filterType !== "ALL" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                {filterType}
                <button
                  onClick={() => setFilterType("ALL")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  title="Remove filter"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filterDate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                {formatDate(filterDate)}
                <button
                  onClick={() => handleDateFilterChange("")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  title="Remove filter"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};