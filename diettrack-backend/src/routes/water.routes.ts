import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import * as waterController from '../controllers/water.controller';

const router = Router();
router.use(authenticate);
router.get('/', waterController.getWater);
router.post('/',
  [
    body('amount').isFloat({ min: 1 }).withMessage('Valid amount required (ml)'),
    body('date').isISO8601().withMessage('Valid date required'),
  ],
  validate,
  waterController.createWater
);
router.put('/:id', waterController.updateWater);
router.delete('/:id', waterController.deleteWater);

export default router;
