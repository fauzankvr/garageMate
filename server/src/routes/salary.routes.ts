import { Router } from "express";
import salaryController from "../controllers/salary.controller";

const router = Router();

router.get("/", salaryController.getAll.bind(salaryController));
router.get("/:id", salaryController.getById.bind(salaryController));
router.get(
  "/employee/:employeeId",
  salaryController.getByEmployeeId.bind(salaryController)
);
router.post("/", salaryController.create.bind(salaryController));
router.put("/:id", salaryController.update.bind(salaryController));
router.delete("/:id", salaryController.delete.bind(salaryController));

export default router;
