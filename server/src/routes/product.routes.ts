import { Router } from "express";
import productController from "../controllers/product.controller";

const router = Router();

router.get('/', productController.getAll.bind(productController));
router.post('/', productController.create.bind(productController));
router.get('/:id', productController.getById.bind(productController));
router.patch('/:id', productController.update.bind(productController));
router.delete('/:id', productController.delete.bind(productController));

export default router;