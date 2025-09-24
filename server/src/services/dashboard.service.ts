import expenseService from "./expense.service";
import ProductService from "./product.service";
import WorkOrderService from "./work.order.service";
import SalaryService from "./salary.service";

class DashboardService {
  async getDatas() {
    try {
      // Fetch expenses
      const expenses = await expenseService.getAll();
      const totalExpensesFromExpenses = expenses.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
      );

      // Fetch salaries
      const salaries = await SalaryService.getAll();
      const totalExpensesFromSalaries = salaries.reduce(
        (sum, salary) => sum + (salary.baseSalary || 0),
        0
      );
      const totalExpenses =
        totalExpensesFromExpenses + totalExpensesFromSalaries;

      // Fetch work orders
      const workOrders = await WorkOrderService.findAll();
      const totalIncome = workOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      const upiIncome = workOrders
        .filter((order) => order.paymentDetails.method === "upi")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const cashIncome = workOrders
        .filter((order) => order.paymentDetails.method === "cash")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const totalSold = workOrders.reduce(
        (sum, order) =>
          sum +
          (order.products?.reduce(
            (itemSum, product) => itemSum + (product.quantity || 0),
            0
          ) || 0),
        0
      );
      const totalServices = workOrders.reduce(
        (sum, order) => sum + (order.services?.length || 0),
        0
      );
      const servicesIncome = workOrders.reduce(
        (sum, order) =>
          sum +
          (order.services?.reduce(
            (serviceSum, service) => serviceSum + (service.price || 0),
            0
          ) || 0),
        0
      );

      // Fetch products for stock
      const products = await ProductService.findAll();
      const totalStock = products.reduce(
        (sum, product) => sum + Number(product.stock || 0),
        0
      );

      // Calculate total profit
      const totalProfit = totalIncome - totalExpenses;

      return {
        totalIncome,
        totalExpenses,
        totalProfit,
        upiIncome,
        cashIncome,
        totalStock,
        totalSold,
        totalServices,
        servicesIncome,
      };
    } catch (error: any) {
      throw new Error(`Error fetching dashboard data: ${error.message}`);
    }
  }
}

export default new DashboardService();
