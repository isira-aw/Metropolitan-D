// components/JobCards/JobCardsFilters.tsx
import React from "react";
import { Filter } from "lucide-react";
import { JobCardResponse } from "../../types/api";

interface JobCardsFiltersProps {
  filterType: "ALL" | "SERVICE" | "REPAIR";
  setFilterType: (type: "ALL" | "SERVICE" | "REPAIR") => void;
  filterDate: string;
  handleDateFilterChange: (date: string) => Promise<void>;
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
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="space-y-4">
        {/* Job Type Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Filter by Job Type
          </label>
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
              {filteredJobCards.length} job card
              {filteredJobCards.length !== 1 ? "s" : ""}
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
  );
};