import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from './dtos/user.dto';
import { User } from './user.entity';
import { JwtService } from 'src/passport/jwt.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async findUserByEmail(username: string): Promise<User> {
    const user: User = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const user: User = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    return user ? user : null;
  }

  async signUp(body: SignUpDto): Promise<string> {
    const { username, password } = body;

    const user = await this.findUserByEmail(username);

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

    return this.jwtService.generateJwt({ sub: newUser.id });
  }
}
