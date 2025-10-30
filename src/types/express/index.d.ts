import { JwtPayload } from 'jsonwebtoken';
import type { UserDto } from '../../dtos/user.dto.ts';

declare global {
  namespace Express {
    export interface Request {
      user?: string | UserDto;
    }
  }
}
