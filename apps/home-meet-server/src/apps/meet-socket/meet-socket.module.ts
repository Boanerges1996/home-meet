import { Module } from '@nestjs/common';
import { MeetSocketService } from './meet-socket.service';
import { MeetSocketGateway } from './meet-socket.gateway';

@Module({
  providers: [MeetSocketGateway, MeetSocketService]
})
export class MeetSocketModule {}
