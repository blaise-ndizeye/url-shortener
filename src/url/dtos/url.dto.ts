import { Exclude, Expose } from 'class-transformer';
import {
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

export class UrlResponseDto {
  constructor(partial: Partial<UrlResponseDto>) {
    Object.assign(this, partial);
  }

  id: number;

  @Exclude()
  short_url: string;

  @Expose({ name: 'shortUrl' })
  shortUrl() {
    return this.short_url;
  }

  @Exclude()
  original_url: string;

  @Expose({ name: 'originalUrl' })
  originalUrl() {
    return this.original_url;
  }

  @Exclude()
  is_password_protected: boolean;

  @Expose({ name: 'isPasswordProtected' })
  isPasswordProtected() {
    return this.is_password_protected;
  }

  @Exclude()
  expires_at: Date | undefined;

  @Expose({ name: 'expiresAt' })
  expiresAt() {
    return this.expires_at;
  }
}
