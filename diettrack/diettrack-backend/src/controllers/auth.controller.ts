import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already registered') sendError(res, error.message, 409);
    else next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid email or password') sendError(res, error.message, 401);
    else next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) { sendError(res, 'Refresh token required', 400); return; }
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  } catch (error) {
    if (error instanceof Error) sendError(res, error.message, 401);
    else next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) await authService.logoutUser(refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) { next(error); }
};
