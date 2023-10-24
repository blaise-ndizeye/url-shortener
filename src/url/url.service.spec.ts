import { PrismaService } from '../../prisma/prisma.service';
import { UrlService } from './url.service';
import {
  CreateShortenedUrlDto,
  UpdateShortenedUrlDto,
  UrlFiltersDto,
  UrlResponseDto,
} from './dtos/url.dto';
import { NotFoundException } from '@nestjs/common';

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

  describe('UpdateUserUrls', () => {
    it('should update a url and return an updated url', async () => {
      const userId = 1;
      const urlId = 1;

      const updateShortenedUrlDto: UpdateShortenedUrlDto = {
        expirationDate: new Date(2023, 12, 30),
        originalUrl: 'https://youtube.com',
        password: 'password123',
      };

      const valueToResolve = {
        id: urlId,
        original_url: updateShortenedUrlDto.originalUrl,
        short_url: 'c215ec1d43',
        number_of_clicks: 0,
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: updateShortenedUrlDto.expirationDate,
        is_password_protected: true,
        password: updateShortenedUrlDto.password,
        user_id: userId,
      };

      //Mock the behavior of the `findOneUrl` method to return a valid URL
      jest
        .spyOn(service, 'findOneUrl')
        .mockResolvedValue(valueToResolve) as jest.Mock;

      const updateMock = jest
        .spyOn(prismaService.url, 'update')
        .mockResolvedValue(valueToResolve) as jest.Mock;

      prismaService.url.update = updateMock;

      const result = await service.updateShortenedUrl(
        urlId,
        updateShortenedUrlDto,
        userId,
      );

      expect(service.findOneUrl).toHaveBeenCalledWith(urlId, userId);

      expect(updateMock).toHaveBeenCalledWith({
        where: {
          id: urlId,
        },
        data: {
          ...(updateShortenedUrlDto.originalUrl && {
            original_url: updateShortenedUrlDto.originalUrl,
          }),
          ...(updateShortenedUrlDto.expirationDate && {
            expires_at: updateShortenedUrlDto.expirationDate,
          }),
          password: expect.any(String),
          short_url: expect.any(String),
          is_password_protected: true,
        },
        select: {
          id: true,
          short_url: true,
          original_url: true,
          is_password_protected: true,
          ...(updateShortenedUrlDto.expirationDate && {
            expires_at: true,
          }),
        },
      });
      expect(result.originalUrl).toEqual(updateShortenedUrlDto.originalUrl);
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

  describe('deleteShortenedUrl', () => {
    it('should delete the shortened URL and return true', async () => {
      // Mock the inputs
      const urlId = 1;
      const userId = 1;

      const valueToResolve = {
        id: urlId,
        original_url: 'https://example.com/original-url',
        short_url: 'c215ec1d43',
        number_of_clicks: 0,
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: new Date(2024, 1, 1),
        is_password_protected: true,
        password: 'password123',
        user_id: userId,
      };

      const findOneUrlMock = jest
        .spyOn(service, 'findOneUrl')
        .mockResolvedValue(valueToResolve) as jest.Mock;

      const deleteManyClicksMock = jest
        .spyOn(prismaService.click, 'deleteMany')
        .mockResolvedValue({ count: 0 }) as jest.Mock;

      const deleteUrlsMock = jest
        .spyOn(prismaService.url, 'delete')
        .mockResolvedValue(valueToResolve) as jest.Mock;

      service.findOneUrl = findOneUrlMock;
      prismaService.click.deleteMany = deleteManyClicksMock;
      prismaService.url.delete = deleteUrlsMock;

      const result = await service.deleteShortenedUrl(urlId, userId);

      expect(findOneUrlMock).toHaveBeenCalledWith(urlId, userId);

      expect(deleteManyClicksMock).toHaveBeenCalledWith({
        where: { url_id: urlId },
      });

      expect(deleteUrlsMock).toHaveBeenCalledWith({
        where: { id: urlId },
      });

      // Expect the result to be true
      expect(result).toBe(undefined);
    });

    it('should throw a NotFoundException when the URL does not exist', async () => {
      // Mock the inputs
      const urlId = 1;
      const userId = 1;

      jest.spyOn(service, 'findOneUrl').mockResolvedValue(null) as jest.Mock;

      jest
        .spyOn(prismaService.url, 'delete')
        .mockRejectedValueOnce(new NotFoundException('URL not found'));

      await expect(
        service.deleteShortenedUrl(urlId, userId),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
