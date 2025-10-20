import { Router } from "express";
import WorkOrderController from "../controllers/work.order.controller";

const router = Router();
router.post("/", WorkOrderController.create);
router.get("/", WorkOrderController.getAll);
router.get("/:id", WorkOrderController.getById);
router.put("/:id", WorkOrderController.update);
router.delete("/:id", WorkOrderController.delete);
router.get("/vehicle/:id", WorkOrderController.getByVehicleId);

export default router;
