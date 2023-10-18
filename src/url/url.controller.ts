import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UrlService } from './url.service';
import {
  CreateShortenedUrlDto,
  UrlFiltersDto,
  UrlResponseDto,
} from './dtos/url.dto';
import { User } from 'src/user/decorators/user.decorator';
import { TokenPayload } from 'src/user/dtos/user.dto';
import { Roles } from 'src/user/decorators/role.decorator';
import { UserRole } from '@prisma/client';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Roles(UserRole.USER)
  @Get('list')
  getUserUrls(@User() user: TokenPayload, @Query() filters: UrlFiltersDto) {
    return this.urlService.getUserUrls(user.id, filters);
  }

  @Roles(UserRole.ADMIN, UserRole.USER)
  @Post()
  createShortenedUrl(
    @Body() body: CreateShortenedUrlDto,
    @User() user: TokenPayload,
  ): Promise<UrlResponseDto> {
    return this.urlService.createShortenedUrl(body, user.id);
  }
}
