import { useState, useEffect, useCallback } from "react";
import instance from "../axios/axios";
import type { DashboardData, Filter } from "../types/dashboard.types";

export const useDashboardData = (initialFilter: Filter) => {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalIncome: 0,
      totalExpenses: 0,
      totalProfit: 0,
      upiIncome: 0,
      cashIncome: 0,
      bothIncome: 0,
      servicesIncome: 0,
      serviceChargesIncome: 0,
      productSalesIncome: 0,
      salaryExpenses: 0,
      otherExpenses: 0,
      totalStock: 0,
      totalSold: 0,
      totalServices: 0,
      recordCounts: {
        expenses: 0,
        salaries: 0,
        workOrders: 0,
        paidWorkOrders: 0,
        products: 0,
      },
    },
    expenses: [],
    loading: true,
    error: null,
  });

  const [filter, setFilter] = useState<Filter>(initialFilter);

  const fetchDashboardData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      const [dashboardRes, expenseRes] = await Promise.all([
        instance.get("/api/dashboard", { params: filter }),
        instance.get("/api/expense", { params: filter }),
      ]);

      setData((prev) => ({
        ...prev,
        stats: dashboardRes.data,
        expenses: expenseRes.data,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard data",
      }));
    }
  }, [filter]);

  const updateFilter = useCallback((newFilter: Partial<Filter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({ month: "", year: "", date: "" });
  }, []);

  const exportToExcel = useCallback(async () => {
    try {
      const response = await instance.get("/api/dashboard/export", {
        params: filter,
        responseType: "blob", // Important for file downloads
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Dashboard_Report_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      throw new Error("Failed to export Excel file");
    }
  }, [filter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Single return statement with all functions
  return {
    ...data,
    filter,
    updateFilter,
    resetFilter,
    refetch: fetchDashboardData,
    exportToExcel,
  };
};
