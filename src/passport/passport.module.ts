import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from './jwt.service';
import { PassportService } from './passport.service';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    PassportService,
    JwtService,
    JwtStrategy,
    UserService,
    PrismaService,
  ],
  exports: [PassportService, JwtService, JwtStrategy],
})
export class PassportAuthModule {}
