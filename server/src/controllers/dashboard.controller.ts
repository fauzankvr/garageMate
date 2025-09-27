import { Request, Response } from "express";
import dashboardService from "../services/dashboard.service";

class DashboardController {
  async getDatas(req: Request, res: Response): Promise<void> {
    try {
      const { month, year, date } = req.query;
      const data = await dashboardService.getDatas({
        month: typeof month === "string" ? month : undefined,
        year: typeof year === "string" ? year : undefined,
        date: typeof date === "string" ? date : undefined,
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard data", error });
    }
  }

  async exportExcel(req: Request, res: Response): Promise<void> {
    try {
      const { month, year, date } = req.query;
      const data = await dashboardService.getDatasForExcel({
        month: typeof month === "string" ? month : undefined,
        year: typeof year === "string" ? year : undefined,
        date: typeof date === "string" ? date : undefined,
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Income_Expenses.xlsx"
      );
      console.log(data)
      res.send(data);
    } catch (error) {
      res.status(500).json({ message: "Error exporting Excel", error });
    }
  }
}

export default new DashboardController();
