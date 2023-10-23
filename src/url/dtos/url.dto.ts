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
  id: number;
  lastClickedDate?: Date;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Exclude()
  user_id: number;

  @Exclude()
  clicks?: {
    clicked_at: Date;
  }[];

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
  expires_at?: Date;

  @Expose()
  get expiresAt() {
    return this?.expires_at;
  }

  set numberOfClicks(value: number) {
    this.number_of_clicks = value;
  }

  set isPasswordProtected(value: boolean) {
    this.is_password_protected = value;
  }

  set originalUrl(value: string) {
    this.original_url = value;
  }

  set shortUrl(value: string) {
    this.short_url = value;
  }

  set expiresAt(value: Date) {
    this.expires_at = value;
  }

  constructor(data: Partial<UrlResponseDto>) {
    Object.assign(this, data);
  }
}
