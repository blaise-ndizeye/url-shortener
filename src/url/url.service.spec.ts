import { PrismaService } from '../../prisma/prisma.service';
import { UrlService } from './url.service';
import { CreateShortenedUrlDto } from './dtos/url.dto';

describe('UrlService', () => {
  let service: UrlService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
    service = new UrlService(prismaService);
  });

  describe('createShortenedUrl', () => {
    it('should create a shortened url when originalUrl is provided', async () => {
      const userId = 1;

      const createShortenedUrlDto: CreateShortenedUrlDto = {
        originalUrl: 'https://example.com',
        expirationDate: new Date(2024, 1, 1),
        password: 'password123',
      };

      // Mock the prismaService.url.create method
      const createMock = jest
        .spyOn(prismaService.url, 'create')
        .mockResolvedValue({
          id: 1,
          original_url: createShortenedUrlDto.originalUrl,
          short_url: 'c215ec1d43',
          number_of_clicks: 0,
          created_at: new Date(),
          updated_at: new Date(),
          expires_at: createShortenedUrlDto.expirationDate,
          is_password_protected: true,
          password: createShortenedUrlDto.password,
          user_id: 1,
        }) as jest.Mock;

      prismaService.url.create = createMock;

      const result = await service.createShortenedUrl(
        createShortenedUrlDto,
        userId,
      );

      expect(createMock).toHaveBeenCalled();

      expect(result.originalUrl).toEqual(createShortenedUrlDto.originalUrl);
      expect(result.shortUrl).toEqual(expect.any(String));
    });
  });
});
