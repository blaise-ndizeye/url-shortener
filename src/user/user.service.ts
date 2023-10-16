import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SignUpDto } from './dtos/user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  private async findUserByEmail(username: string): Promise<User> {
    const user: User = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    return user;
  }

  async signUp(body: SignUpDto) {
    const { username, password } = body;

    const user = await this.findUserByEmail(username);

    if (user) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prismaService.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
  }
}
