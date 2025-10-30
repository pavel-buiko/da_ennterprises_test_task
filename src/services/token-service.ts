import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient.js';
import dotenv from 'dotenv';
import { ApiError } from '../exceptions/api-error.js';

dotenv.config();

interface TokenPayload {
  id: string;
  login: string;
}

class TokenService {
  private accessSecret: string;
  private refreshSecret: string;

  constructor(accessSecret: string, refreshSecret: string) {
    if (!accessSecret) throw new Error('JWT access secret must be provided');
    this.accessSecret = accessSecret;

    if (!refreshSecret) throw new Error('JWT refresh secret must be provided');
    this.refreshSecret = refreshSecret;
  }

  generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, this.accessSecret, { expiresIn: '10m' });
    const refreshToken = jwt.sign(payload, this.refreshSecret, { expiresIn: '14d' });
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(userId: string, refreshToken: string, ip: string, userAgent?: string) {
    const session = await prisma.session.create({
      data: {
        userId: userId,
        refreshToken: refreshToken,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    return session;
  }

  async deleteRefreshToken(refreshToken: string, userAgent?: string) {
    const tokenData = await prisma.session.findMany({
      where: { refreshToken, userAgent: userAgent ?? null },
    });

    if (tokenData.length === 0) throw ApiError.UnauthorizedError();

    await prisma.session.deleteMany({
      where: { id: { in: tokenData.map((t) => t.id) } },
    });
  }

  validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(token, this.accessSecret) as TokenPayload;

      return userData;
    } catch (error) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(token, this.refreshSecret) as TokenPayload;

      return userData;
    } catch (error) {
      return null;
    }
  }

  async findRefreshToken(token: string) {
    const tokenData = prisma.session.findFirst({
      where: { refreshToken: token },
    });
    return tokenData;
  }
}

const accessToken = process.env.JWT_ACCESS_SECRET ?? '';
const refreshToken = process.env.JWT_REFRESH_SECRET ?? '';

export const tokenService = new TokenService(accessToken, refreshToken);
