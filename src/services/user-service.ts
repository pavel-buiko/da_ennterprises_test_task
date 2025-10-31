import bcrypt from 'bcryptjs';
import { prisma } from '../prismaClient.js';
import { tokenService } from './token-service.js';
import { ApiError } from '../exceptions/api-error.js';
import { UserDto } from '../dtos/user.dto.js';

class UserService {
  async signup(login: string, password: string, ip: string, userAgent?: string) {
    await this.ensureUserDoesNotExist(login);
    const user = await this.createUser(login, password);
    return this.createUserTokens({ id: user.id, login, ip, userAgent });
  }

  async signin(login: string, password: string, ip: string, userAgent?: string) {
    const user = await this.getUserByLogin(login);
    await this.verifyPassword(password, user.password);
    return this.createUserTokens({ id: user.id, login, ip, userAgent });
  }

  async signout(token: string, userAgent?: string) {
    await tokenService.deleteRefreshToken(token, userAgent);
  }

  async refresh(token: string, ip: string, userAgent: string) {
    if (!token) throw ApiError.UnauthorizedError();

    const userData = tokenService.validateRefreshToken(token);
    const tokenData = await tokenService.findRefreshToken(token);

    if (!userData || !tokenData) throw ApiError.UnauthorizedError();

    const user = await this.findById(userData.id);
    return this.createUserTokens({ id: user.id, login: user.login, ip: ip, userAgent: userAgent });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.UnauthorizedError();
    return user;
  }

  private async ensureUserDoesNotExist(login: string) {
    const candidate = await prisma.user.findFirst({ where: { login } });
    if (candidate) throw ApiError.BadRequest(`Пользователь с login ${login} уже существует`);
  }

  private async createUser(login: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 3);
    return prisma.user.create({ data: { login, password: hashedPassword } });
  }

  private async getUserByLogin(login: string) {
    const user = await prisma.user.findFirst({ where: { login } });
    if (!user) throw ApiError.BadRequest('Пользователь с таким email не найден');
    return user;
  }

  private async verifyPassword(plain: string, hash: string) {
    const valid = await bcrypt.compare(plain, hash);
    if (!valid) throw ApiError.BadRequest('Неверный пароль');
  }

  private async createUserTokens(payload: { id: string; login: string; ip: string; userAgent?: string }) {
    let session = await prisma.session.findFirst({
      where: {
        userId: payload.id,
        ip: payload.ip,
        revoked: false,
        expiresAt: { gt: new Date() },
        userAgent: payload.userAgent ?? null,
      },
    });

    const refreshToken = tokenService.generateRefreshToken({ id: payload.id, login: payload.login });

    if (session) {
      session = await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      session = await tokenService.saveRefreshToken(payload.id, refreshToken, payload.ip, payload.userAgent);
    }
    const accessToken = tokenService.generateAccessToken({ id: payload.id, login: payload.login, sid: session.id });

    const safeUser = new UserDto({ id: payload.id, login: payload.login });
    return { accessToken, refreshToken, safeUser };
  }
}

export const userService = new UserService();
