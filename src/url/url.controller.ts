import { Body, Controller, Post } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateShortenedUrlDto, UrlResponseDto } from './dtos/url.dto';
import { User } from 'src/user/decorators/user.decorator';
import { TokenPayload } from 'src/user/dtos/user.dto';
import { Roles } from 'src/user/decorators/role.decorator';
import { UserRole } from '@prisma/client';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Roles(UserRole.ADMIN, UserRole.USER)
  @Post()
  createShortenedUrl(
    @Body() body: CreateShortenedUrlDto,
    @User() user: TokenPayload,
  ): Promise<UrlResponseDto> {
    return this.urlService.createShortenedUrl(body, user.id);
  }
}
