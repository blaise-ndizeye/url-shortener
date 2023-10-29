import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, PrismaService, ConfigService],
    }).compile();

    controller = app.get<AppController>(AppController);
    service = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('root', () => {
    it('should redirect to original url', async () => {
      const shortUrl = 'https://google.com';
      const password = '123';

      jest.spyOn(service, 'goToOriginalUrl').mockResolvedValue({
        url: 'https://google.com',
      });

      expect(await controller.goToOrginalUrl(shortUrl, password)).toEqual({
        url: 'https://google.com',
      });
    });
  });
});
