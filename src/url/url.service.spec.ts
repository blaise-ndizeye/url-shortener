import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShortenedUrlDto } from './dtos/url.dto';

describe('UrlService', () => {
  let service: UrlService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlService, PrismaService],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.spyOn(prismaService.url, 'findMany').mockResolvedValue([]);
    jest.spyOn(prismaService.url, 'create').mockResolvedValue({
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
    });
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

    // Add more test cases to cover other possible breaches
  });

  // Add more test cases for other functions in UrlService
});
