import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  SignInDto,
  SignUpDto,
  TokenPayload,
  UpdateUserDto,
} from './dtos/user.dto';
import { UserService } from './user.service';
import { Roles } from './decorators/role.decorator';
import { UserRole } from '@prisma/client';
import { User } from './decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(UserRole.ADMIN)
  @Get('list')
  getAllUsers(@User() user: TokenPayload) {
    return this.userService.getAllUsers(user.id);
  }

  @Post('signup')
  signUp(@Body() body: SignUpDto) {
    return this.userService.signUp(body);
  }

  @Post('signin')
  signIn(@Body() body: SignInDto) {
    return this.userService.signIn(body);
  }

  @Roles(UserRole.ADMIN, UserRole.USER)
  @Put()
  updateUser(@User() user: TokenPayload, @Body() body: UpdateUserDto) {
    return this.userService.updateUser(user.id, body);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':userId')
  deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
    @User() admin: TokenPayload,
  ) {
    return this.userService.deleteUser(userId, admin.id);
  }
}
