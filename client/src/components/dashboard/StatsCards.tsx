import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Package,
  UserCheck,
} from "lucide-react";
import type { DashboardStats } from "../../types/dashboard.types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
  subText?: string;
}> = ({ title, value, icon, gradient, textColor, subText }) => (
  <div
    className={`${gradient} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
  >
    <div className="flex items-center justify-between">
      <div className="p-3 bg-white bg-opacity-20 rounded-lg">{icon}</div>
      <div className="text-right">
        <p className={`text-sm font-medium ${textColor} mb-1`}>{title}</p>
        <p className={`text-2xl font-bold ${textColor.replace("700", "900")}`}>
          {value}
        </p>
        {subText && <p className={`text-xs ${textColor} mt-1`}>{subText}</p>}
      </div>
    </div>
  </div>
);

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <>
      {/* Financial Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome)}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          gradient="bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
          textColor="text-green-700"
        />

        <StatsCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          icon={<TrendingDown className="w-6 h-6 text-red-600" />}
          gradient="bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
          textColor="text-red-700"
        />

        <StatsCard
          title="Total Profit"
          value={formatCurrency(stats.totalProfit)}
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
          gradient="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
          textColor={stats.totalProfit >= 0 ? "text-blue-700" : "text-red-700"}
          subText={
            stats.totalIncome > 0
              ? `${((stats.totalProfit / stats.totalIncome) * 100).toFixed(1)}%`
              : undefined
          }
        />

        <StatsCard
          title="Total Services"
          value={formatNumber(stats.totalServices)}
          icon={<UserCheck className="w-6 h-6 text-purple-600" />}
          gradient="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
          textColor="text-purple-700"
        />
      </div>

      {/* Payment Methods & Inventory Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="UPI Payments"
          value={formatCurrency(stats.upiIncome)}
          icon={<CreditCard className="w-6 h-6 text-indigo-600" />}
          gradient="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200"
          textColor="text-indigo-700"
          subText={
            stats.totalIncome > 0
              ? `${((stats.upiIncome / stats.totalIncome) * 100).toFixed(
                  1
                )}% of total`
              : undefined
          }
        />

        <StatsCard
          title="Cash Payments"
          value={formatCurrency(stats.cashIncome)}
          icon={<DollarSign className="w-6 h-6 text-orange-600" />}
          gradient="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200"
          textColor="text-orange-700"
          subText={
            stats.totalIncome > 0
              ? `${((stats.cashIncome / stats.totalIncome) * 100).toFixed(
                  1
                )}% of total`
              : undefined
          }
        />

        <StatsCard
          title="Total Stock"
          value={`${formatNumber(stats.totalStock)} items`}
          icon={<Package className="w-6 h-6 text-gray-600" />}
          gradient="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
          textColor="text-gray-700"
        />
      </div>
    </>
  );
};

export default StatsCards;
