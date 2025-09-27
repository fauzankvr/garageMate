import React from "react";
import { Package } from "lucide-react";
import type { Expense } from "../../types/dashboard.types";

interface RecentExpensesProps {
  expenses: Expense[];
}

const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses }) => {
  const recentExpenses = expenses.slice(-5).reverse();

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {recentExpenses.map((expense) => (
          <div
            key={expense._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">{expense.category}</p>
                <p className="text-sm text-gray-500">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-red-600">
                -₹{(expense.expense || 0).toLocaleString()}
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
  );
};

export default RecentExpenses;
