import React from "react";
import { BarChart3, PieChart } from "lucide-react";
import type { DashboardStats } from "../../types/dashboard.types";

interface ChartsSectionProps {
  stats: DashboardStats;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Sales vs Expenses Chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Sales vs Expenses
          </h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-sm">
              Sales: {formatCurrency(stats.totalIncome)}
            </p>
            <p className="text-sm">
              Expenses: {formatCurrency(stats.totalExpenses)}
            </p>
            <p className="text-sm font-medium mt-2">
              Profit: {stats.totalProfit >= 0 ? "+" : ""}
              {formatCurrency(stats.totalProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Methods
          </h3>
          <PieChart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <PieChart className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>UPI:</span>
                <span className="font-medium">
                  {formatCurrency(stats.upiIncome)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cash:</span>
                <span className="font-medium">
                  {formatCurrency(stats.cashIncome)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Both:</span>
                <span className="font-medium">
                  {formatCurrency(stats.bothIncome)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(stats.totalIncome)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
