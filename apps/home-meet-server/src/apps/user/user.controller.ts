import { JwtAuthUserGuard } from '@/apps/jwt';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { HomeMeetApiResponse } from '../common';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthUserGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<HomeMeetApiResponse> {
    return this.userService.getUserProfile(id);
  }
}
