import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShortenedUrlDto, UrlResponseDto } from './dtos/url.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UrlService {
  constructor(private readonly prismaService: PrismaService) {}

  private generateShortenedUrl(): string {
    return crypto.randomBytes(5).toString('hex');
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
}
