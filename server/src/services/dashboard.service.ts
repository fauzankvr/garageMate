// src/services/DashboardService.ts

import expenseService from "./expense.service";
import ProductService from "./product.service";
import WorkOrderService from "./work.order.service";
import SalaryService from "./salary.service";
import * as ExcelJS from "exceljs";

export interface Filter {
  month?: string; // Format: "01", "02", etc.
  year?: string; // Format: "2024", "2025", etc.
  date?: string; // Format: "2024-01-15"
}

class DashboardService {
  async getDatas(filter: Filter = {}) {
    try {
      console.log("Fetching dashboard data with filter:", filter);

      // Apply filters to expenses
      const expenses = await expenseService.getAll(filter);
      const totalExpensesFromExpenses = expenses.reduce(
        (sum: number, expense: any) => sum + (expense.amount || 0),
        0
      );

      // Apply filters to salaries
      const salaries = await SalaryService.getAll(filter);
      const totalExpensesFromSalaries = salaries.reduce(
        (sum: number, salary: any) => sum + (salary.paid || 0),
        0
      );

      const totalExpenses =
        totalExpensesFromExpenses + totalExpensesFromSalaries;

      // Apply filters to work orders (income)
      const workOrders = await WorkOrderService.findAll(filter);

      // Total income from paid work orders only
      const totalIncome = workOrders
        .filter((order: any) => order.status === "paid")
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      // Payment method breakdown
      const upiIncome = workOrders
        .filter(
          (order: any) =>
            order.status === "paid" && order.paymentDetails.method === "upi"
        )
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      const cashIncome = workOrders
        .filter(
          (order: any) =>
            order.status === "paid" && order.paymentDetails.method === "cash"
        )
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      const bothIncome = workOrders
        .filter(
          (order: any) =>
            order.status === "paid" && order.paymentDetails.method === "both"
        )
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      // Products sold (from work orders)
      const totalSold = workOrders.reduce(
        (sum: number, order: any) =>
          sum +
          (order.products?.reduce(
            (itemSum: number, product: any) =>
              itemSum + (product.quantity || 0),
            0
          ) || 0),
        0
      );

      // Services provided
      const totalServices = workOrders.reduce(
        (sum: number, order: any) => sum + (order.services?.length || 0),
        0
      );

      // Services income
      const servicesIncome = workOrders
        .filter((order: any) => order.status === "paid")
        .reduce(
          (sum: number, order: any) =>
            sum +
            (order.services?.reduce(
              (serviceSum: number, service: any) =>
                serviceSum + (service.price || 0),
              0
            ) || 0),
          0
        );

      // Service charges income
      const serviceChargesIncome = workOrders
        .filter((order: any) => order.status === "paid")
        .reduce(
          (sum: number, order: any) => sum + (order.totalServiceCharge || 0),
          0
        );

      // Product sales income
      const productSalesIncome = workOrders
        .filter((order: any) => order.status === "paid")
        .reduce(
          (sum: number, order: any) => sum + (order.totalProductCost || 0),
          0
        );

      // Fetch products for stock
      const products = await ProductService.findAll(filter);
      const totalStock = products.reduce(
        (sum: number, product: any) => sum + Number(product.stock || 0),
        0
      );

      const totalProfit = totalIncome - totalExpenses;

      const result = {
        // Income Breakdown
        totalIncome,
        upiIncome,
        cashIncome,
        bothIncome,
        servicesIncome,
        serviceChargesIncome,
        productSalesIncome,

        // Expense Breakdown
        totalExpenses,
        salaryExpenses: totalExpensesFromSalaries,
        otherExpenses: totalExpensesFromExpenses,

        // Business Metrics
        totalProfit,
        totalStock,
        totalSold,
        totalServices,

        // Record Counts
        recordCounts: {
          expenses: expenses.length,
          salaries: salaries.length,
          workOrders: workOrders.length,
          paidWorkOrders: workOrders.filter(
            (order: any) => order.status === "paid"
          ).length,
          products: products.length,
        },
      };

      console.log("Dashboard data fetched successfully");
      return result;
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      throw new Error(`Error fetching dashboard data: ${error.message}`);
    }
  }

  
  async getDatasForExcel(filter: Filter = {}): Promise<Buffer> {
    const expenses = await expenseService.getAll(filter);
    const salaries = await SalaryService.getAll(filter);
    const workOrders = await WorkOrderService.findAll(filter);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Transactions");

    sheet.columns = [
      { header: "Roll Number", key: "roll", width: 12 },
      { header: "Date", key: "date", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Category", key: "category", width: 20 },
      { header: "Income Money IN", key: "moneyIn", width: 15 },
      { header: "Expense Money OUT", key: "moneyOut", width: 15 },
      { header: "Overall Balance", key: "balance", width: 18 },
    ];

    // Header row
    sheet.insertRow(1, {
      roll: `Report Period: ${this.getFilterDescription(filter)}`,
      date: `Generated: ${new Date().toLocaleDateString()}`,
    });

    // Combine all transactions
    type TX = { date: Date; desc: string; category: string; in: number; out: number };
    const txs: TX[] = [];

    // Expenses
    expenses.forEach(e => {
      txs.push({
        date: new Date(e.date),
        desc: e.category || "Expense",
        category: e.category,
        in: 0,
        out: e.amount || 0,
      });
    });

    // Salaries as expenses, include employee name
    salaries.forEach(s => {
      txs.push({
        date: new Date(s.createdAt + "-" + s.month + "-01"),
        desc: `Salary (${typeof s.employee === "object" && "name" in s.employee ? (s.employee.name as string) : ""})`,
        category: "Salary",
        in: 0,
        out: s.paid || 0,
      });
    });

    // Work orders as income, include customer name if available
    workOrders
      .filter(o => o.status === "paid")
      .forEach(o => {
        const date = new Date(o.createdAt ?? Date.now());
        txs.push({
          date,
          desc: `Order (${
            typeof o.customerId === "object" && "name" in o.customerId
              ? (o.customerId.name as string)
              : ""
          })`,
          category: "Bill",
          in: o.totalAmount || 0,
          out: 0,
        });
      });

    // Sort by date ascending
    txs.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Write rows with running balance
    let runningBalance = 0;
    txs.forEach((t, idx) => {
      runningBalance += (t.in || 0) - (t.out || 0);
      sheet.addRow({
        roll: idx + 1,
        date: t.date.toLocaleDateString(),
        description: t.desc,
        category: t.category,
        moneyIn: t.in || "",
        moneyOut: t.out || "",
        balance: runningBalance,
      });
    });

    // Totals
    const totalIn = txs.reduce((sum, t) => sum + (t.in || 0), 0);
    const totalOut = txs.reduce((sum, t) => sum + (t.out || 0), 0);
    sheet.addRow({
      roll: "Total",
      date: "",
      description: "",
      category: "",
      moneyIn: totalIn,
      moneyOut: totalOut,
      balance: runningBalance,
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  private getFilterDescription(filter: Filter): string {
    if (filter.date) return `Date: ${filter.date}`;
    if (filter.month && filter.year) return `Month: ${filter.month}-${filter.year}`;
    if (filter.year) return `Year: ${filter.year}`;
    return "All Time";
  }
}


export default new DashboardService();
