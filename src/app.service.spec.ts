import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AppService', () => {
  let appService: AppService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, PrismaService],
    }).compile();

    appService = module.get<AppService>(AppService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('goToOriginalUrl', () => {
    it('should throw NotImplementedException if hostname is not defined', async () => {
      process.env.HOSTNAME = '';
      const shortUrl = 'abc123';

      await expect(appService.goToOriginalUrl(shortUrl)).rejects.toThrow(
        NotImplementedException,
      );
    });

    it('should throw NotFoundException if the url does not exist', async () => {
      process.env.HOSTNAME = 'example.com';
      const shortUrl = 'nonexistent';

      jest.spyOn(prismaService.url, 'findUnique').mockResolvedValue(null);

      await expect(appService.goToOriginalUrl(shortUrl)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if the url is expired', async () => {
      process.env.HOSTNAME = 'example.com';
      const shortUrl = 'expired';

      jest.spyOn(prismaService.url, 'findUnique').mockResolvedValue({
        expires_at: new Date('2021-01-01'),
        created_at: new Date(),
        updated_at: new Date(),
        id: 1,
        short_url: shortUrl,
        is_password_protected: true,
        number_of_clicks: 0,
        password: expect.any(String),
        user_id: 1,
        original_url: 'https://example.com',
      });

      await expect(appService.goToOriginalUrl(shortUrl)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw UnauthorizedException if the url is password-protected and no password is provided', async () => {
      process.env.HOSTNAME = 'example.com';
      const shortUrl = 'password-protected';

      jest.spyOn(prismaService.url, 'findUnique').mockResolvedValue({
        id: 1,
        short_url: shortUrl,
        is_password_protected: true,
        password: bcrypt.hashSync('password', 10),
        user_id: 1,
        original_url: 'https://example.com',
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: new Date('2024-01-01'),
        number_of_clicks: 0,
      });

      await expect(appService.goToOriginalUrl(shortUrl)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if the url is password-protected and an incorrect password is provided', async () => {
      process.env.HOSTNAME = 'example.com';
      const shortUrl = 'password-protected';
      const password = 'incorrect';

      jest.spyOn(prismaService.url, 'findUnique').mockResolvedValue({
        id: 1,
        short_url: shortUrl,
        is_password_protected: true,
        password: bcrypt.hashSync('password', 10),
        user_id: 1,
        original_url: 'https://example.com',
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: new Date('2024-01-01'),
        number_of_clicks: 0,
      });

      await expect(
        appService.goToOriginalUrl(shortUrl, password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should create a click and update the number of clicks for the url', async () => {
      process.env.HOSTNAME = 'example.com';
      const shortUrl = 'valid-url';

      const urlData = {
        id: 1,
        short_url: shortUrl,
        is_password_protected: false,
        number_of_clicks: 0,
        user_id: 1,
        original_url: 'https://example.com',
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: new Date('2024-01-01'),
        password: undefined,
      };

      jest.spyOn(prismaService.url, 'findUnique').mockResolvedValue(urlData);

      jest.spyOn(prismaService.click, 'create').mockResolvedValue({
        id: 1,
        url_id: urlData.id,
        clicked_at: new Date(),
      });

      jest.spyOn(prismaService.url, 'update').mockResolvedValue({
        ...urlData,
        number_of_clicks: urlData.number_of_clicks + 1,
      });

      await expect(appService.goToOriginalUrl(shortUrl)).resolves.toEqual({
        url: urlData.original_url,
      });

      expect(prismaService.click.create).toHaveBeenCalledWith({
        data: {
          url_id: urlData.id,
        },
      });

      expect(prismaService.url.update).toHaveBeenCalledWith({
        where: {
          id: urlData.id,
        },
        data: {
          number_of_clicks: urlData.number_of_clicks + 1,
        },
      });
    });
  });
});
