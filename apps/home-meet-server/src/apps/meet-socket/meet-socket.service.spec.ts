import { Test, TestingModule } from '@nestjs/testing';
import { MeetSocketService } from './meet-socket.service';

describe('MeetSocketService', () => {
  let service: MeetSocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetSocketService],
    }).compile();

    service = module.get<MeetSocketService>(MeetSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
