import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signUp(@Body() body: SignUpDto) {
    return this.userService.signUp(body);
  }
}
