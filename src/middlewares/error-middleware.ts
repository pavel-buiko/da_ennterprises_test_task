import { ApiError } from '../exceptions/api-error.js';
import type { Request, Response, NextFunction } from 'express';

export const ErrorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message, errors: error.errors });
  }

  return res.status(500).json({ message: 'Неизвестная ошибка' });
};
