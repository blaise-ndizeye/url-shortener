import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PassportService {
  constructor(private readonly userService: UserService) {}

  validateUserById(id: number): Promise<User | null> {
    const user = this.userService.getUserById(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
