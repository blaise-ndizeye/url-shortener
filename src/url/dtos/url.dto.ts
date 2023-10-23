import { ConfigService } from '@nestjs/config';
import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateShortenedUrlDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsDate()
  expirationDate: Date;

  @IsOptional()
  @IsString()
  password: string;
}

export class UpdateShortenedUrlDto extends CreateShortenedUrlDto {
  @IsOptional()
  originalUrl: string;
}

export class UrlFiltersDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsBoolean()
  expired: boolean;
}

export class UrlResponseDto {
  constructor(partial: Partial<UrlResponseDto>) {
    Object.assign(this, partial);
  }

  id: number;
  lastClickedDate: Date | undefined;

  @Exclude()
  clicks:
    | {
        clicked_at: Date;
      }[]
    | undefined;

  @Exclude()
  number_of_clicks: number;

  @Expose()
  get numberOfClicks() {
    return this.number_of_clicks;
  }

  @Exclude()
  short_url: string;

  @Expose()
  get shortUrl() {
    const configService = new ConfigService();
    const hostname = configService.get<string>('HOSTNAME');

    return `${hostname}/${this.short_url}`;
  }

  @Exclude()
  original_url: string;

  @Expose()
  get originalUrl() {
    return this.original_url;
  }

  @Exclude()
  is_password_protected: boolean;

  @Expose()
  get isPasswordProtected() {
    return this.is_password_protected;
  }

  @Exclude()
  expires_at: Date | undefined;

  @Expose()
  get expiresAt() {
    return this?.expires_at;
  }
}
