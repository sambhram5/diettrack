import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as weightService from '../services/weight.service';
import { sendSuccess, sendError } from '../utils/response';

export const getWeights = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;
    const logs = await weightService.getWeightLogs(req.user!.userId, days);
    sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
};

export const createWeight = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const log = await weightService.createWeightLog(req.user!.userId, req.body);
    sendSuccess(res, log, 'Weight logged', 201);
  } catch (error) {
    next(error);
  }
};

export const updateWeight = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const log = await weightService.updateWeightLog(req.params.id, req.user!.userId, req.body);
    sendSuccess(res, log, 'Weight updated');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      sendError(res, error.message, 404);
    } else {
      next(error);
    }
  }
};

export const deleteWeight = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await weightService.deleteWeightLog(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Weight log deleted');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      sendError(res, error.message, 404);
    } else {
      next(error);
    }
  }
};
