import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import * as foodController from '../controllers/food.controller';

const router = Router();

router.use(authenticate);

router.get('/', foodController.getFoods);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Food name required'),
    body('servingSize').isFloat({ min: 1 }).withMessage('Valid serving size required'),
    body('calories').isFloat({ min: 0 }).withMessage('Valid calories required'),
    body('protein').isFloat({ min: 0 }).withMessage('Valid protein required'),
    body('carbs').isFloat({ min: 0 }).withMessage('Valid carbs required'),
    body('fat').isFloat({ min: 0 }).withMessage('Valid fat required'),
  ],
  validate,
  foodController.createFood
);

router.put('/:id', foodController.updateFood);
router.delete('/:id', foodController.deleteFood);

export default router;
