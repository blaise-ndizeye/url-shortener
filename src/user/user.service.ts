import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { SignInDto, SignUpDto, TokenPayload } from './dtos/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async findUserByUsername(username: string): Promise<User> {
    const user: User = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    return user;
  }

  generateJWT(payload: TokenPayload): string {
    return jwt.sign(payload, this.configService.get<string>('JWT_SECRET'), {
      expiresIn: '1d',
    });
  }

  async signUp(body: SignUpDto): Promise<string> {
    const { username, password } = body;

    const user = await this.findUserByUsername(username);

    if (user) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prismaService.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return this.generateJWT({ id: newUser.id });
  }

  async signIn(body: SignInDto): Promise<string> {
    const { username, password } = body;

    const user = await this.findUserByUsername(username);

    if (!user) {
      throw new BadRequestException('Invalid Credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new BadRequestException('Invalid Credentials');
    }

    return this.generateJWT({ id: user.id });
  }
}
