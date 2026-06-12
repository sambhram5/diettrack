import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as foodService from '../services/food.service';
import { sendSuccess, sendError } from '../utils/response';

export const getFoods = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const foods = await foodService.getFoods(req.user!.userId, search);
    sendSuccess(res, foods);
  } catch (error) {
    next(error);
  }
};

export const createFood = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const food = await foodService.createFood(req.user!.userId, req.body);
    sendSuccess(res, food, 'Food created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateFood = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const food = await foodService.updateFood(req.params.id, req.user!.userId, req.body);
    sendSuccess(res, food, 'Food updated');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      sendError(res, error.message, 404);
    } else {
      next(error);
    }
  }
};

export const deleteFood = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await foodService.deleteFood(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Food deleted');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      sendError(res, error.message, 404);
    } else {
      next(error);
    }
  }
};
