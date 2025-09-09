import { Router } from "express";
import WorkOrderController from "../controllers/work.order.controller";

const router = Router();

router.post("/", WorkOrderController.create);

router.get("/", WorkOrderController.getAll);

export default router;
