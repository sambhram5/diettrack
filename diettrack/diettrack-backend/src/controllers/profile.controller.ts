import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as profileService from '../services/profile.service';
import { sendSuccess, sendError } from '../utils/response';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await profileService.getProfile(req.user!.userId);
    if (!profile) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await profileService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, profile, 'Profile updated');
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('not found') ||
      error.message.includes('password')
    )) {
      sendError(res, error.message, 400);
    } else {
      next(error);
    }
  }
};
