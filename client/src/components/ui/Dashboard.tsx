import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Package,
  ShoppingCart,
  UserCheck,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react";

import UserActions from "../layout/headers/UserActions";
import Sidebar from "../layout/Sidebar";
import type { Expense } from "../../types/Expense";
import instance from "../../axios/axios";

// Dashboard Stats Interface
interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalProfit: number;
  upiIncome: number;
  cashIncome: number;
  totalStock: number;
  totalSold: number;
  totalServices: number;
  servicesIncome: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    totalProfit: 0,
    upiIncome: 0,
    cashIncome: 0,
    totalStock: 0,
    totalSold: 0,
    totalServices: 0,
    servicesIncome: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data from single endpoint
      const res = await instance.get("/api/dashboard");
      const {
        totalIncome,
        totalExpenses,
        totalProfit,
        upiIncome,
        cashIncome,
        totalStock,
        totalSold,
        totalServices,
        servicesIncome,
      } = res.data;

      setStats({
        totalIncome,
        totalExpenses,
        totalProfit,
        upiIncome,
        cashIncome,
        totalStock,
        totalSold,
        totalServices,
        servicesIncome,
      });

      // Fetch recent expenses separately (if needed for recent activity section)
      const expenseRes = await instance.get("/api/expense");
      setExpenses(expenseRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="hidden md:block bg-white">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-600">
              Loading Dashboard...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block bg-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex space-x-2">
              <UserActions />
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Financial Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Income */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    ${stats.totalIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-700 mb-1">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    ${stats.totalExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Profit */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Total Profit
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      stats.totalProfit >= 0 ? "text-blue-900" : "text-red-900"
                    }`}
                  >
                    ${stats.totalProfit.toLocaleString()}
                  </p>
                  {stats.totalIncome > 0 && (
                    <span
                      className={`text-xs font-medium ${
                        stats.totalProfit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {((stats.totalProfit / stats.totalIncome) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Total Services */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Total Services
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.totalServices.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods & Inventory Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* UPI Income */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-indigo-700 mb-1">
                    UPI Payments
                  </p>
                  <p className="text-xl font-bold text-indigo-900">
                    ${stats.upiIncome.toLocaleString()}
                  </p>
                  {stats.totalIncome > 0 && (
                    <p className="text-xs text-indigo-600 mt-1">
                      {((stats.upiIncome / stats.totalIncome) * 100).toFixed(1)}
                      % of total
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cash Income */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-700 mb-1">
                    Cash Payments
                  </p>
                  <p className="text-xl font-bold text-orange-900">
                    ${stats.cashIncome.toLocaleString()}
                  </p>
                  {stats.totalIncome > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      {((stats.cashIncome / stats.totalIncome) * 100).toFixed(
                        1
                      )}
                      % of total
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Total Stock */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Package className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Total Stock
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalStock.toLocaleString()} items
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
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
                    Sales: ${stats.totalIncome.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Expenses: ${stats.totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Profit: {stats.totalProfit >= 0 ? "+" : ""}$
                    {stats.totalProfit.toLocaleString()}
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
                    <p className="text-sm flex justify-between">
                      <span>UPI: </span>
                      <span className="font-medium">
                        ${stats.upiIncome.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span>Cash: </span>
                      <span className="font-medium">
                        ${stats.cashIncome.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-sm flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Total: </span>
                      <span>${stats.totalIncome.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Expenses */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Expenses
                </h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {expenses
                  .slice(-5)
                  .reverse()
                  .map((expense) => (
                    <div
                      key={expense._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {expense.category}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          -${expense.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                {expenses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p>No recent expenses</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              {/* Sold Items */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">
                    Items Sold
                  </p>
                  <ShoppingCart className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalSold.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +12% from last month
                </p>
              </div>

              {/* Services Income */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">
                    Services Income
                  </p>
                  <UserCheck className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xl font-bold text-gray-900">
                  ${stats.servicesIncome.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {stats.totalServices} services completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
