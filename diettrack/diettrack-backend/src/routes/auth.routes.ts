import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('age').isInt({ min: 13, max: 120 }).withMessage('Valid age required'),
    body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Valid gender required'),
    body('height').isFloat({ min: 100, max: 250 }).withMessage('Valid height required (cm)'),
    body('weight').isFloat({ min: 30, max: 300 }).withMessage('Valid weight required (kg)'),
    body('activityLevel')
      .isIn(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE'])
      .withMessage('Valid activity level required'),
    body('goal')
      .isIn(['WEIGHT_LOSS', 'WEIGHT_MAINTENANCE', 'WEIGHT_GAIN', 'MUSCLE_GAIN'])
      .withMessage('Valid goal required'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
