import { Test, TestingModule } from '@nestjs/testing';
import { MeetSocketGateway } from './meet-socket.gateway';
import { MeetSocketService } from './meet-socket.service';

describe('MeetSocketGateway', () => {
  let gateway: MeetSocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetSocketGateway, MeetSocketService],
    }).compile();

    gateway = module.get<MeetSocketGateway>(MeetSocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
