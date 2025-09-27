import React, { useState } from "react";
import type {
  Filter,
  Expense,
  DashboardStats,
} from "../../types/dashboard.types";

interface FilterControlsProps {
  filter: Filter;
  onFilterChange: (filter: Partial<Filter>) => void;
  onApplyFilters: () => void;
  expenses: Expense[];
  stats: DashboardStats;
  onExportExcel: () => Promise<void>;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filter,
  onFilterChange,
  onApplyFilters,
  onExportExcel,
  expenses,
  stats,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    onFilterChange({ [e.target.name]: e.target.value });
  };

  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      await onExportExcel();
    } catch (error) {
      console.error("Excel export error:", error);
      setExportError("Failed to export Excel file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilter = () => {
    onFilterChange({ month: "", year: "", date: "" });
  };

  const hasActiveFilter = filter.month || filter.year || filter.date;

  return (
    <div className="mb-6 space-y-4">
      {/* Filter Controls Row */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-wrap gap-2">
          <select
            name="month"
            value={filter.month}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            name="year"
            value={filter.year}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[100px]"
          >
            <option value="">All Years</option>
            {Array.from({ length: 5 }, (_, i) => {
              const year = 2023 + i;
              return (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              );
            })}
          </select>

          <input
            type="date"
            name="date"
            value={filter.date}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onApplyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Apply Filters
          </button>

          {hasActiveFilter && (
            <button
              onClick={clearFilter}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Clear
            </button>
          )}

          <button
            onClick={handleDownloadExcel}
            disabled={isExporting}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isExporting
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            }`}
          >
            {isExporting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-200"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Exporting...
              </span>
            ) : (
              "Download Excel"
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {exportError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{exportError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setExportError(null)}
                className="text-red-400 hover:text-red-600 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Summary */}
      {hasActiveFilter && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Active filters:{" "}
                  {filter.date && (
                    <span className="font-medium">Date: {filter.date}</span>
                  )}
                  {filter.month && !filter.date && (
                    <span className="font-medium">
                      Month:{" "}
                      {new Date(0, parseInt(filter.month) - 1).toLocaleString(
                        "default",
                        { month: "long" }
                      )}
                    </span>
                  )}
                  {filter.year && !filter.date && (
                    <span className="font-medium ml-2">
                      Year: {filter.year}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={clearFilter}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Total Records
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {stats.recordCounts?.expenses +
              stats.recordCounts?.salaries +
              stats.recordCounts?.workOrders || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Expenses
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {expenses.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Work Orders
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {stats.recordCounts?.workOrders || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Products
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {stats.recordCounts?.products || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
