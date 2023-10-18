import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { TokenPayload } from '../dtos/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    ////
    try {
      const roles = this.reflector.getAllAndOverride('roles', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (roles?.length) {
        const request = context.switchToHttp().getRequest();
        const token = request?.headers?.authorization?.split(' ')[1];

        const payload = jwt.verify(
          token,
          this.configService.get<string>('JWT_SECRET'),
        ) as TokenPayload;

        const user = await this.prismaService.user.findUnique({
          where: {
            id: payload.id,
          },
        });

        if (!user || (user && !roles.includes(user.role))) return false;

        return true;
      }

      return true;
    } catch (_) {
      throw new UnauthorizedException();
    }
  }
}
