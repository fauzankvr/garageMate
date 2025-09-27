import * as XLSX from "xlsx";
import type { Expense, DashboardStats } from "../types/dashboard.types";

export const generateExcelReport = (
  expenses: Expense[],
  stats: DashboardStats
): void => {
  const data = [
    [
      "Account",
      "Date",
      "Description",
      "Category",
      "Income",
      "Expense",
      "Overall Balance",
    ],
    ...expenses.map((expense) => [
      expense.account,
      new Date(expense.date).toLocaleDateString(),
      expense.description,
      expense.category,
      expense.income || 0,
      expense.expense || 0,
      (expense.income || 0) - (expense.expense || 0),
    ]),
    [
      "Total",
      "",
      "",
      "",
      stats.totalIncome,
      stats.totalExpenses,
      stats.totalProfit,
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "IncomeExpenses");
  XLSX.writeFile(
    wb,
    `Income_Expenses_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};
