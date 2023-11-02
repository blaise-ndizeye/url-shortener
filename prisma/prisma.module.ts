import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

@Module({
  providers: [
    PrismaService,
    {
      provide: 'DATABASE_URL',
      useFactory: (configService: ConfigService) => {
        if (process.env.NODE_ENV === 'test') {
          return configService.get<string>('TEST_DATABASE_URL');
        }
        return configService.get<string>('DATABASE_URL');
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
