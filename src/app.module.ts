import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from 'prisma/prisma.service';
import { PassportAuthModule } from './passport/passport.module';

@Module({
  imports: [UserModule, PassportAuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
