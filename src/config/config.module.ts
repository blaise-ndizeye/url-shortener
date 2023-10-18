import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['*.env'],
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
})
export class CustomConfigModule {}
