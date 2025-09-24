import { Router } from "express";
import expenseController from "../controllers/expense.controller";

const router = Router();

router.get("/", expenseController.getAll.bind(expenseController));
router.get("/:id", expenseController.getById.bind(expenseController));
router.post("/", expenseController.create.bind(expenseController));
router.put("/:id", expenseController.update.bind(expenseController));
router.delete("/:id", expenseController.delete.bind(expenseController));

export default router;
