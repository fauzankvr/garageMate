import React from "react";
import { ShoppingCart, UserCheck } from "lucide-react";
import type { DashboardStats } from "../../types/dashboard.types";

interface QuickStatsProps {
  stats: DashboardStats;
}

const QuickStatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  subText: string;
  subTextColor: string;
}> = ({ title, value, icon, subText, subTextColor }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {icon}
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
    <p className={`text-sm ${subTextColor}`}>{subText}</p>
  </div>
);

const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <QuickStatsCard
        title="Items Sold"
        value={stats.totalSold.toLocaleString()}
        icon={<ShoppingCart className="w-5 h-5 text-gray-400" />}
        subText="+12% from last month"
        subTextColor="text-green-600"
      />

      <QuickStatsCard
        title="Services Income"
        value={`₹${stats.servicesIncome.toLocaleString()}`}
        icon={<UserCheck className="w-5 h-5 text-gray-400" />}
        subText={`${stats.totalServices} services completed`}
        subTextColor="text-blue-600"
      />
    </div>
  );
};

export default QuickStats;
