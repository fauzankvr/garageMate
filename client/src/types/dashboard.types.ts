export interface Filter {
  month: string;
  year: string;
  date: string;
}

export interface Expense {
  _id: string;
  account: string;
  date: string;
  description: string;
  category: string;
  income?: number;
  expense?: number;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalProfit: number;
  upiIncome: number;
  cashIncome: number;
  bothIncome: number;
  servicesIncome: number;
  serviceChargesIncome: number;
  productSalesIncome: number;
  salaryExpenses: number;
  otherExpenses: number;
  totalStock: number;
  totalSold: number;
  totalServices: number;
  recordCounts: {
    expenses: number;
    salaries: number;
    workOrders: number;
    paidWorkOrders: number;
    products: number;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}
