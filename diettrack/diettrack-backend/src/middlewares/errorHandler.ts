import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  console.error('❌ Error:', err.message);

  const prismaErr = err as Error & { code?: string; meta?: { target?: unknown } };

  if (prismaErr.code === 'P2002') {
    res.status(409).json({ success: false, message: 'A record with this value already exists', field: prismaErr.meta?.target });
    return;
  }
  if (prismaErr.code === 'P2003') {
    res.status(409).json({ success: false, message: 'Cannot delete or modify record because it is referenced by other data' });
    return;
  }
  if (prismaErr.code === 'P2025') {
    res.status(404).json({ success: false, message: 'Record not found' });
    return;
  }
  if (err.name === 'PrismaClientValidationError') {
    res.status(400).json({ success: false, message: 'Invalid data provided' });
    return;
  }
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expired' });
    return;
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};
