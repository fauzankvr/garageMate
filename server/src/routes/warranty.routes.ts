import { Router } from "express";
import warrantyController from "../controllers/warranty.controller";

const router = Router();

router.get("/", warrantyController.getAll.bind(warrantyController));
router.get("/:id", warrantyController.getById.bind(warrantyController));
router.post("/", warrantyController.create.bind(warrantyController));
router.put("/:id", warrantyController.update.bind(warrantyController));
router.delete("/:id", warrantyController.delete.bind(warrantyController));

export default router;
