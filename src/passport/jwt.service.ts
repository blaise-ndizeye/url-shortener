import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret = process.env.JWT_SECRET;

  generateJwt(payload: { sub: number }): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: '1d',
    });
  }

  verifyJwt(token: string) {
    try {
      const decoded = jwt.verify(token, this.secret);
      return decoded;
    } catch (_) {
      throw new UnauthorizedException();
    }
  }
}
