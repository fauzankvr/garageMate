import { Request, Response } from "express";
import dashboardService from "../services/dashboard.service";

class DashboardController {
  async getDatas(req: Request, res: Response): Promise<void> {
    try {
      const data = await dashboardService.getDatas();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard data", error });
    }
  }
}

export default new DashboardController();
