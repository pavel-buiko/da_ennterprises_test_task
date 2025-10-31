import type { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user-service.js';
import { signupSchema } from '../schemas/user.schema.js';
import { ApiError } from '../exceptions/api-error.js';
import { tokenService } from '../services/token-service.js';

interface RequestWithCookies extends Request {
  cookies: {
    [key: string]: string;
  };
}

export class UserController {
  constructor() {}

  signup = async (req: Request<{}, any, { login: string; password: string }>, res: Response, next: NextFunction) => {
    try {
      const result = signupSchema.safeParse(req.body);

      if (!result.success) {
        const messages = result.error.issues.map((issue) => `${issue.message}`);

        return next(ApiError.BadRequest('Ошибка валидации', messages));
      }

      const { login, password } = result.data;

      console.log(req.ip);

      const userData = await userService.signup(login, password, req.ip!, req.headers['user-agent'] as string);

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 14 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
      });

      return res.json(userData);
    } catch (error) {
      next(error);
    }
  };

  signin = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;

    const userAgent = req.headers['user-agent'];

    try {
      const result = signupSchema.safeParse(req.body);

      if (!result.success) {
        const messages = result.error.issues.map((issue) => `${issue.message}`);

        return next(ApiError.BadRequest('Ошибка валидации', messages));
      }

      const { login, password } = result.data;

      const userData = await userService.signin(login, password, ip ?? ' ', userAgent);

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 14 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
      });

      return res.json(userData);
    } catch (error) {
      next(error);
    }
  };

  signout = async (req: RequestWithCookies, res: Response, next: NextFunction) => {
    try {
      const userAgent = req.headers['user-agent'];
      const refreshToken = req.cookies['refreshToken'];
      if (!refreshToken) {
        return next(ApiError.UnauthorizedError());
      }

      await userService.signout(refreshToken, userAgent ?? '');

      res.clearCookie('refreshToken');

      return res.status(200).json({ message: 'Успешный выход' });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: RequestWithCookies, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies['refreshToken'];

      const userAgent = req.headers['user-agent'];

      if (!refreshToken) {
        return next(ApiError.UnauthorizedError());
      }

      const userData = await userService.refresh(refreshToken, req.ip!, userAgent ?? '');

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 14 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
      });

      return res.json(userData);
    } catch (error) {}
  };

  info = async (req: Request, res: Response, next: NextFunction) => {
    const userInfo = req.headers.authorization ?? '';

    if (!userInfo) {
      throw ApiError.BadRequest('Could not verify token');
    }

    const accessToken = userInfo.split(' ')[1];

    if (!accessToken) {
      throw ApiError.BadRequest('Could not verify token');
    }

    const tokenData = await tokenService.validateAccessToken(accessToken);

    res.json({ login: tokenData?.login });
  };
}

export const userController = new UserController();
