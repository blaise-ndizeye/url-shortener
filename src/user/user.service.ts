import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SignInDto,
  SignUpDto,
  TokenPayload,
  UpdateUserDto,
  UserResponseDto,
} from './dtos/user.dto';

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

  async findUserById(userId: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
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

  async getAllUsers(userId: number) {
    const allUsers = await this.prismaService.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    return allUsers.map((user) => new UserResponseDto(user));
  }

  async deleteUser(userId: number, adminId: number) {
    const userToDelete = await this.findUserById(userId);

    if (!userToDelete) {
      throw new NotFoundException();
    }

    if (userToDelete.id === adminId) {
      throw new ForbiddenException();
    }

    const userUrls = await this.prismaService.url.findMany({
      where: {
        user_id: userId,
      },
    });

    const promise1 = this.prismaService.click.deleteMany({
      where: {
        url_id: {
          in: [...userUrls.map((url) => url.id)],
        },
      },
    });

    const promise2 = this.prismaService.url.deleteMany({
      where: {
        user_id: userId,
      },
    });

    const promise3 = this.prismaService.user.delete({
      where: {
        id: userId,
      },
    });

    await Promise.all([promise1, promise2, promise3]);
  }

  async updateUser(userId: number, body: UpdateUserDto) {
    const userToUpdate = await this.findUserById(userId);

    if (!userToUpdate) {
      throw new NotFoundException();
    }

    if (body?.newPassword && !body?.oldPassword) {
      throw new BadRequestException('old password is required');
    }

    if (
      body?.oldPassword &&
      !bcrypt.compareSync(body?.oldPassword, String(userToUpdate.password))
    ) {
      throw new BadRequestException('invalid old password');
    }

    const hashedPassword = body?.newPassword
      ? await bcrypt.hash(String(body?.newPassword), 10)
      : undefined;

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(body?.username && { username: body.username }),
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    return new UserResponseDto(updatedUser);
  }
}
