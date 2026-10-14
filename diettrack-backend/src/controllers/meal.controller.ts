import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as mealService from '../services/meal.service';
import { sendSuccess, sendError } from '../utils/response';

export const getMeals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const date = req.query.date as string | undefined;
    const result = date
      ? await mealService.getDailyNutrition(req.user!.userId, date)
      : { meals: await mealService.getMeals(req.user!.userId), totals: null };
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

export const createMeal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const meal = await mealService.createMeal(req.user!.userId, req.body);
    sendSuccess(res, meal, 'Meal logged', 201);
  } catch (error) { next(error); }
};

export const updateMeal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const meal = await mealService.updateMeal(req.params.id, req.user!.userId, req.body);
    sendSuccess(res, meal, 'Meal updated');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) sendError(res, error.message, 404);
    else next(error);
  }
};

export const deleteMeal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await mealService.deleteMeal(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Meal deleted');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) sendError(res, error.message, 404);
    else next(error);
  }
};
