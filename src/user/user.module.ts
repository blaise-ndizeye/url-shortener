import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from 'src/passport/jwt.service';

@Module({
  controllers: [UserController],
  providers: [PrismaService, UserService, JwtService],
  exports: [UserService],
})
export class UserModule {}
