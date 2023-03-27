import { Body, Controller, Post } from '@nestjs/common';
import { UserLoginDto, UserSignupDto } from '../user/dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() body: UserSignupDto) {
    return this.userService.signupUser(body);
  }

  @Post('login')
  async login(@Body() body: UserLoginDto) {
    return this.userService.loginUser(body);
  }
}
