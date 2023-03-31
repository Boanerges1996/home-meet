import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../common';
import { JwtAuthUserGuard } from '../jwt';
import { CreateMeetDto } from './dto';
import { MeetService } from './meet.service';

@ApiTags('Meet')
@ApiBearerAuth()
@Controller('meet')
@UseGuards(JwtAuthUserGuard)
export class MeetController {
  constructor(private readonly meetService: MeetService) {}

  @Post('create')
  async createMeet(@Body() body: CreateMeetDto) {
    return this.meetService.createMeet(body);
  }

  @Get('get/:id')
  @Public()
  async getMeetById(@Param('id') id: string) {
    return this.meetService.getMeetById(id);
  }

  @Get('get-by-user/:userId')
  async getMeetsByUserId(@Param('userId') userId: string) {
    return this.meetService.getMeetsByUserId(userId);
  }

  @Get('get-all')
  @Public()
  async getMeets() {
    return this.meetService.getMeets();
  }
}
