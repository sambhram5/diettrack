import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { getDashboard } from '../services/dashboard.service';
import { getAnalytics } from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

export const dashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const data = await getDashboard(req.user!.userId, date);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const analytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const period = (req.query.period as '7d' | '30d' | '90d') || '30d';
    const data = await getAnalytics(req.user!.userId, period);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
