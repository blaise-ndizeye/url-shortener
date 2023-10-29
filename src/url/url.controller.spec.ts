import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShortenedUrlDto, UrlResponseDto } from './dtos/url.dto';
import { BadRequestException } from '@nestjs/common';

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

  describe('createSHortenedUrl', () => {
    it('should create shortened url', async () => {
      const data = new UrlResponseDto({
        id: 1,
        originalUrl: 'https://google.com',
        shortUrl: 'https://short.com',
        numberOfClicks: 0,
        expiresAt: new Date(2024, 1, 1),
        isPasswordProtected: true,
      });

      jest.spyOn(service, 'createShortenedUrl').mockResolvedValue(data);

      await expect(
        controller.createShortenedUrl(
          { id: 1 },
          {
            originalUrl: 'https://google.com',
            expirationDate: new Date(2024, 1, 1),
            password: '123',
          },
        ),
      ).resolves.toEqual(data);
    });

    it('should throw BadRequestException when expirationDate is not in future', async () => {
      const body: CreateShortenedUrlDto = {
        expirationDate: new Date(),
        originalUrl: 'https://google.com',
        password: '123',
      };

      await expect(
        controller.createShortenedUrl({ id: 1 }, body),
      ).rejects.toThrowError(BadRequestException);
    });
  });
});
