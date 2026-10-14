import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import * as weightController from '../controllers/weight.controller';

const router = Router();
router.use(authenticate);
router.get('/', weightController.getWeights);
router.post('/',
  [
    body('weight').isFloat({ min: 20, max: 500 }).withMessage('Valid weight required (kg)'),
    body('date').isISO8601().withMessage('Valid date required'),
  ],
  validate,
  weightController.createWeight
);
router.put('/:id', weightController.updateWeight);
router.delete('/:id', weightController.deleteWeight);

export default router;
