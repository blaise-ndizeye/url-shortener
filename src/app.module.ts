import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { UserInterceptor } from './user/interceptos/user.interceptor';
import { AuthGuard } from './user/guards/user.guard';
import { UrlModule } from './url/url.module';
import { CustomConfigModule } from './config/config.module';

@Module({
  imports: [UserModule, UrlModule, CustomConfigModule, PrismaModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
