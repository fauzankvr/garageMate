import { Router } from "express";
import servicesController from "../controllers/services.controller";

const router = Router();

router.get('/', servicesController.getAll.bind(servicesController));
router.post('/', servicesController.create.bind(servicesController));
router.get('/:id', servicesController.getById.bind(servicesController));
router.patch("/:id", servicesController.update.bind(servicesController));
router.delete("/:id", servicesController.delete.bind(servicesController));

export default router;