import { Test, TestingModule } from '@nestjs/testing';
import { SocksService } from './socks.service';

describe('SocksService', () => {
  let service: SocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocksService],
    }).compile();

    service = module.get<SocksService>(SocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
