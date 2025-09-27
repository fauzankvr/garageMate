import React from "react";
import { useDashboardData } from "../../hooks/useDashboardData";
import DashboardHeader from "./DashboardHeader"; 
import FilterControls from "./FilterControls"; 
import StatsCards from "./StatsCards"; 
import ChartsSection from "./ChartsSection"; 
import RecentExpenses from "./RecentExpenses"; 
import QuickStats from "./QuickStats"; 
import Sidebar from "../layout/Sidebar";
import LoadingSpinner from "./LoadingSpinner";

const Dashboard: React.FC = () => {
const {
  stats,
  expenses,
  loading,
  error,
  filter,
  updateFilter,
//   resetFilter,
  refetch,
  exportToExcel, // This will now be available
} = useDashboardData({ month: "", year: "", date: "" });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="hidden md:block bg-white">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <h2 className="text-xl font-semibold mb-2">
              Error Loading Dashboard
            </h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block bg-white">
        <Sidebar />
      </div>

      <div className="flex-1">
        <DashboardHeader />

        <div className="p-4 sm:p-6 lg:p-8">
          <FilterControls
            filter={filter}
            onFilterChange={updateFilter}
            onApplyFilters={refetch}
            onExportExcel={exportToExcel} // Pass the export function
            expenses={expenses}
            stats={stats}
          />

          <StatsCards stats={stats} />

          <ChartsSection stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentExpenses expenses={expenses} />
            <QuickStats stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
