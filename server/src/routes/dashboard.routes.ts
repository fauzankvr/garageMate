import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller";

const router = Router();

router.get("/", dashboardController.getDatas.bind(dashboardController));
router.get(
  "/export",
  dashboardController.exportExcel.bind(dashboardController)
);

export default router;
