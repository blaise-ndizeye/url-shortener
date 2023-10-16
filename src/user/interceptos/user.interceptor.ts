import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { TokenPayload } from '../dtos/user.dto';

export class UserInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    ////

    const request = context.switchToHttp().getRequest();
    const token = request?.headers?.authorization?.split(' ')[1];

    const payload = jwt.decode(token) as TokenPayload;

    request.user = payload;

    return next.handle();
  }
}
