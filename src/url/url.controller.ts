import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UrlService } from './url.service';
import {
  CreateShortenedUrlDto,
  UpdateShortenedUrlDto,
  UrlFiltersDto,
} from './dtos/url.dto';
import { User } from 'src/user/decorators/user.decorator';
import { TokenPayload } from 'src/user/dtos/user.dto';
import { Roles } from 'src/user/decorators/role.decorator';

@Controller('url')
@Roles(UserRole.ADMIN, UserRole.USER)
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Get('list')
  getUserUrls(@User() user: TokenPayload, @Query() filters: UrlFiltersDto) {
    return this.urlService.getUserUrls(user.id, filters);
  }

  @Post()
  createShortenedUrl(
    @User() user: TokenPayload,
    @Body() body: CreateShortenedUrlDto,
  ) {
    return this.urlService.createShortenedUrl(body, user.id);
  }

  @Put(':urlId')
  updateShortenedUrl(
    @Param('urlId', ParseIntPipe) urlId: number,
    @User() user: TokenPayload,
    @Body() body: UpdateShortenedUrlDto,
  ) {
    return this.urlService.updateShortenedUrl(urlId, body, user.id);
  }

  @Delete(':urlId')
  deleteShortenedUrl(
    @User() user: TokenPayload,
    @Param('urlId', ParseIntPipe) urlId: number,
  ) {
    return this.urlService.deleteShortenedUrl(urlId, user.id);
  }
}
