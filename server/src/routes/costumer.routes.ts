import { Router } from 'express';
import costumerController from '../controllers/costumer.controller';

const router = Router();

router.get('/phone', costumerController.getByPhone.bind(costumerController));
router.get('/', costumerController.getAll.bind(costumerController));
router.get('/:id', costumerController.getById.bind(costumerController));
router.post('/', costumerController.create.bind(costumerController));
router.put('/:id', costumerController.update.bind(costumerController));
router.delete('/:id', costumerController.delete.bind(costumerController));

export default router;