import { PrismaService } from '../../prisma/prisma.service';
import { UrlService } from './url.service';
import {
  CreateShortenedUrlDto,
  UrlFiltersDto,
  UrlResponseDto,
} from './dtos/url.dto';

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

  describe('getUserUrls', () => {
    it('should return an array of user urls based on filters', async () => {
      // Mock the inputs
      const userId = 1;
      const filters: UrlFiltersDto = {
        expired: true,
        search: 'example',
      };

      // Mock the expected output
      const expectedUrls: UrlResponseDto[] = [
        new UrlResponseDto({
          id: 1,
          originalUrl: 'https://example.com',
          shortUrl: 'c215ec1d43',
          numberOfClicks: 0,
          expiresAt: expect.any(Date),
          isPasswordProtected: true,
        }),
      ];

      // Mock the `findMany` method of the `prismaService.url` object
      const findManyMock = jest
        .spyOn(prismaService.url, 'findMany')
        .mockResolvedValue([
          {
            id: 1,
            original_url: 'https://example.com',
            short_url: 'c215ec1d43',
            number_of_clicks: 0,
            created_at: new Date(),
            updated_at: new Date(),
            expires_at: new Date(),
            is_password_protected: true,
            password: 'string',
            user_id: 1,
          },
        ]) as jest.Mock;

      // Call the `getUserUrls` function
      const result = await service.getUserUrls(userId, filters);

      // Expect the result to match the expected output
      const resultUrls = result.map(
        (url) =>
          new UrlResponseDto({
            id: url.id,
            originalUrl: url.original_url,
            shortUrl: url.short_url,
            numberOfClicks: url.number_of_clicks,
            expiresAt: url.expires_at,
            isPasswordProtected: url.is_password_protected,
          }),
      );

      expect(resultUrls).toEqual(expectedUrls);

      // Expect the `findMany` method to have been called with the correct arguments
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          original_url: { contains: filters.search },
          expires_at: { lte: expect.any(Date) },
        },
        select: {
          id: true,
          original_url: true,
          short_url: true,
          number_of_clicks: true,
          created_at: true,
          expires_at: true,
          is_password_protected: true,
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
      });
    });
  });
});
