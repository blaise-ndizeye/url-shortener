import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SignUpDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/passport/guards/jwt-auth.guard';
import { JwtService } from 'src/passport/jwt.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  signUp(@Body() body: SignUpDto): Promise<string> {
    return this.userService.signUp(body);
  }

  @Post('signin')
  signIn(@Request() req: any) {
    return this.jwtService.generateJwt(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUser(@Request() req: any) {}
}
