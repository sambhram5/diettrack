import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import * as mealController from '../controllers/meal.controller';

const router = Router();

router.use(authenticate);

router.get('/', mealController.getMeals);

router.post(
  '/',
  [
    body('mealType').isIn(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).withMessage('Valid meal type required'),
    body('date').isISO8601().withMessage('Valid date required'),
    body('items').isArray({ min: 1 }).withMessage('At least one food item required'),
    body('items.*.foodId').notEmpty().withMessage('Food ID required'),
    body('items.*.quantity').isFloat({ min: 0.1 }).withMessage('Valid quantity required'),
  ],
  validate,
  mealController.createMeal
);

router.put('/:id', mealController.updateMeal);
router.delete('/:id', mealController.deleteMeal);

export default router;
