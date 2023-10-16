import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { TokenPayload } from '../dtos/user.dto';

export const User = createParamDecorator(
  (_, context: ExecutionContext): TokenPayload | null => {
    const request = context.switchToHttp().getRequest();

    return request?.user;
  },
);
