import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../exceptions/api-error.js';
import { tokenService } from '../services/token-service.js';
import { prisma } from '../prismaClient.js';

export async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }
    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData || !userData.sid) {
      return next(ApiError.UnauthorizedError());
    }

    const session = await prisma.session.findUnique({ where: { id: userData.sid } });
    if (!session || session.revoked || session.expiresAt <= new Date()) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData;

    next();
  } catch (error) {
    return next(ApiError.UnauthorizedError());
  }
}
