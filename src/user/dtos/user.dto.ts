import { UserRole } from '@prisma/client';
import { Exclude } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;
}

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsOptional()
  @IsString()
  newPassword?: string;
}

export interface TokenPayload {
  id: number;
}

export class UserResponseDto {
  id: number;
  username: string;
  role: UserRole;

  @Exclude()
  password: string;
  constructor(data: Partial<UserResponseDto>) {
    Object.assign(this, data);
  }
}
