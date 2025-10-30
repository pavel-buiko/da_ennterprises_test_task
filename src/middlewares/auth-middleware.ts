import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../exceptions/api-error.js';
import { tokenService } from '../services/token-service.js';

export function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }
    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData;

    next();
  } catch (error) {
    return next(ApiError.UnauthorizedError());
  }
}
