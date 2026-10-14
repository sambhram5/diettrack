import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as waterService from '../services/water.service';
import { sendSuccess, sendError } from '../utils/response';

export const getWater = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const date = req.query.date as string | undefined;
    const result = date
      ? await waterService.getDailyWater(req.user!.userId, date)
      : await waterService.getWaterLogs(req.user!.userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const createWater = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const log = await waterService.createWaterLog(req.user!.userId, req.body);
    sendSuccess(res, log, 'Water logged', 201);
  } catch (error) {
    next(error);
  }
};

export const updateWater = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const log = await waterService.updateWaterLog(req.params.id, req.user!.userId, req.body.amount);
    sendSuccess(res, log, 'Water log updated');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      sendError(res, error.message, 404);
    } else {
      next(error);
    }
  }
};

export const deleteWater = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await waterService.deleteWaterLog(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Water log deleted');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      sendError(res, error.message, 404);
    } else {
      next(error);
    }
  }
};
