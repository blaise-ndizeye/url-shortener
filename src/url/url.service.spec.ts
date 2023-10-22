import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { UrlService } from './url.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateShortenedUrlDto,
  UpdateShortenedUrlDto,
  UrlFiltersDto,
} from './dtos/url.dto';

describe('UrlService', () => {
  let service: UrlService;
  let prismaService: PrismaService;

  const referenceObject = {
    id: 1,
    original_url: 'https://example.com',
    short_url: 'https://short.example.com',
    number_of_clicks: 0,
    created_at: new Date(),
    updated_at: new Date(),
    expires_at: new Date(),
    is_password_protected: false,
    password: '',
    user_id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlService, PrismaService],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.spyOn(prismaService.url, 'findMany').mockResolvedValue([]);
    jest.spyOn(prismaService.url, 'create').mockResolvedValue(referenceObject);
    jest.spyOn(prismaService.url, 'update').mockResolvedValue(referenceObject);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShortenedUrl', () => {
    it('should not create a shortened URL if the original URL is empty', async () => {
      const body = { originalUrl: '', expirationDate: null, password: null };
      const userId = 1;

      await expect(service.createShortenedUrl(body, userId)).rejects.toThrow();
      expect(prismaService.url.create).not.toHaveBeenCalled();
    });

    it('should create a shortened URL if the original URL is provided', async () => {
      const body = new CreateShortenedUrlDto();
      body.originalUrl = 'https://example.com';
      const userId = 1;

      await expect(
        service.createShortenedUrl(body, userId),
      ).resolves.toBeTruthy();
      expect(prismaService.url.create).toHaveBeenCalled();
    });
  });

  describe('getUserUrls', () => {
    it('should call prismaService.url.findMany with correct arguments', async () => {
      const userId = 1;
      const filters: UrlFiltersDto = { expired: false, search: 'y' };

      await service.getUserUrls(userId, filters);

      expect(prismaService.url.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          number_of_clicks: true,
          short_url: true,
          original_url: true,
          is_password_protected: true,
          created_at: true,
          ...(filters.expired && { expires_at: true }),
          clicks: {
            select: {
              clicked_at: true,
            },
            orderBy: {
              clicked_at: 'desc',
            },
            take: 1,
          },
        },
        where: {
          user_id: userId,
          ...(filters.expired && { expires_at: { lt: new Date() } }),
          ...(filters.search && { original_url: { contains: filters.search } }),
        },
      });
    });

    it('should return array of user URLs', async () => {
      const userId = 1;
      const filters: UrlFiltersDto = { expired: false, search: 'example' };

      const result = await service.getUserUrls(userId, filters);

      expect(result).toEqual([]);
    });
  });

  describe('updateShortenedUrl', () => {
    it('should call prismaService.url.update with the correct arguments', async () => {
      const urlId = 8;
      const userId = 3;
      const shortUrl = expect.any(String);

      const updateUrlDto: UpdateShortenedUrlDto = {
        originalUrl: 'https://example.com',
        expirationDate: new Date(2024, 1, 1),
        password: expect.any(String),
      };

      await service.updateShortenedUrl(urlId, updateUrlDto, userId);

      expect(prismaService.url.update).toHaveBeenCalledWith({
        where: {
          id: urlId,
        },
        data: {
          original_url: updateUrlDto.originalUrl,
          expires_at: updateUrlDto.expirationDate,
          is_password_protected: true,
          password: updateUrlDto.password,
          short_url: shortUrl,
        },
        select: {
          id: true,
          short_url: true,
          original_url: true,
          is_password_protected: true,
          ...(updateUrlDto.expirationDate && { expires_at: true }),
        },
      });
    });

    it('should return the updated URL', async () => {
      const urlId = 8;
      const userId = 3;
      const updateUrlDto: UpdateShortenedUrlDto = {
        originalUrl: 'https://example.com',
        expirationDate: new Date(2024, 1, 1),
        password: 'password',
      };

      const result = await service.updateShortenedUrl(
        urlId,
        updateUrlDto,
        userId,
      );

      expect(result).toEqual(referenceObject);
    });
  });
});
