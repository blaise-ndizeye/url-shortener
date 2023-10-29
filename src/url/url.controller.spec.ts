import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UrlResponseDto } from './dtos/url.dto';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [UrlService, PrismaService, ConfigService],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserUrls', () => {
    it('should return all user urls', async () => {
      const data = new UrlResponseDto({
        id: 1,
        originalUrl: 'https://google.com',
        shortUrl: 'https://short.com',
        numberOfClicks: 0,
        expiresAt: new Date(),
        isPasswordProtected: false,
      });

      jest.spyOn(service, 'getUserUrls').mockResolvedValue([data]);

      await expect(
        controller.getUserUrls({ id: 1 }, { expired: true, search: 'ort' }),
      ).resolves.toEqual([data]);
    });
  });
});
