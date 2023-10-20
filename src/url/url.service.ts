import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateShortenedUrlDto,
  UpdateShortenedUrlDto,
  UrlFiltersDto,
  UrlResponseDto,
} from './dtos/url.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Url } from '@prisma/client';

@Injectable()
export class UrlService {
  constructor(private readonly prismaService: PrismaService) {}

  private generateShortenedUrl(): string {
    return crypto.randomBytes(5).toString('hex');
  }

  private async findOneUrl(urlId: number, userId: number): Promise<Url> {
    const urlFound = await this.prismaService.url.findUnique({
      where: {
        id: urlId,
        user_id: userId,
      },
    });

    if (!urlFound) {
      throw new NotFoundException();
    }

    return urlFound;
  }

  async getUserUrls(
    userId: number,
    filters: UrlFiltersDto,
  ): Promise<UrlResponseDto[]> {
    const { expired, search } = filters;
    const toDay = new Date();

    let urls = await this.prismaService.url.findMany({
      select: {
        id: true,
        number_of_clicks: true,
        short_url: true,
        original_url: true,
        is_password_protected: true,
        ...(expired && { expires_at: true }),
      },
      where: {
        user_id: userId,
        ...(search && { original_url: { contains: search } }),
      },
    });

    if (expired) {
      urls = urls.filter((url) => url.expires_at < toDay);
    }

    return urls.map((url) => new UrlResponseDto(url));
  }

  async createShortenedUrl(
    body: CreateShortenedUrlDto,
    userId: number,
  ): Promise<UrlResponseDto> {
    let { originalUrl, expirationDate, password } = body;

    expirationDate = new Date(expirationDate);
    const currentDate = new Date();

    if (expirationDate && expirationDate < currentDate) {
      throw new BadRequestException('expiration date must be in future');
    }

    const hashedUrlPassword = password
      ? bcrypt.hashSync(password, 10)
      : undefined;

    let shortenedUrl = this.generateShortenedUrl();

    const newUrl = await this.prismaService.url.create({
      data: {
        user_id: userId,
        original_url: originalUrl,
        short_url: shortenedUrl,
        ...(expirationDate && { expires_at: expirationDate }),
        ...(hashedUrlPassword && {
          password: hashedUrlPassword,
          is_password_protected: true,
        }),
      },
      select: {
        id: true,
        short_url: true,
        original_url: true,
        is_password_protected: true,
        ...(expirationDate && { expires_at: true }),
      },
    });

    return new UrlResponseDto(newUrl);
  }

  async updateShortenedUrl(
    urlId: number,
    body: UpdateShortenedUrlDto,
    userId: number,
  ) {
    const urlToUpdate = await this.findOneUrl(urlId, userId);

    let { originalUrl, expirationDate, password } = body;

    expirationDate = new Date(expirationDate);
    const currentDate = new Date();

    if (expirationDate && expirationDate < currentDate) {
      throw new BadRequestException('expiration date must be in future');
    }

    const hashedUrlPassword = password
      ? bcrypt.hashSync(password, 10)
      : undefined;

    let shortenedUrl = this.generateShortenedUrl();

    const updatedUrl = await this.prismaService.url.update({
      where: {
        id: urlToUpdate.id,
      },
      data: {
        ...(originalUrl && { original_url: originalUrl }),
        ...(shortenedUrl && { short_url: shortenedUrl }),
        ...(expirationDate && { expires_at: expirationDate }),
        ...(hashedUrlPassword && {
          password: hashedUrlPassword,
          is_password_protected: true,
        }),
      },
      select: {
        id: true,
        short_url: true,
        original_url: true,
        is_password_protected: true,
        ...(expirationDate && { expires_at: true }),
      },
    });

    return new UrlResponseDto(updatedUrl);
  }

  async deleteShortenedUrl(urlId: number, userId: number) {
    const urlTodelete = await this.findOneUrl(urlId, userId);

    await this.prismaService.click.deleteMany({
      where: {
        url_id: urlTodelete.id,
      },
    });

    await this.prismaService.url.delete({
      where: {
        id: urlTodelete.id,
      },
    });
  }
}
