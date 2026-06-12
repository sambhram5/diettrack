import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as exportService from '../services/export.service';
import { sendSuccess, sendError } from '../utils/response';

export const exportData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const type = req.params.type as 'meals' | 'weights' | 'water' | 'all';
    const { from, to } = req.query as { from?: string; to?: string };
    const userId = req.user!.userId;

    if (type === 'all') {
      const data = await exportService.exportAll(userId);
      sendSuccess(res, data, 'Export ready');
      return;
    }

    let csv: string;
    let filename: string;

    switch (type) {
      case 'meals':
        csv = await exportService.exportMeals(userId, from, to);
        filename = 'diettrack-meals.csv';
        break;
      case 'weights':
        csv = await exportService.exportWeights(userId);
        filename = 'diettrack-weights.csv';
        break;
      case 'water':
        csv = await exportService.exportWater(userId);
        filename = 'diettrack-water.csv';
        break;
      default:
        sendError(res, 'Invalid export type. Use: meals, weights, water, all', 400);
        return;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const weeklyReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const report = await exportService.weeklyReport(req.user!.userId);
    sendSuccess(res, report, 'Weekly report generated');
  } catch (error) {
    next(error);
  }
};
