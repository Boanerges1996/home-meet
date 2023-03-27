import { Test, TestingModule } from '@nestjs/testing';
import { SocksGateway } from './socks.gateway';
import { SocksService } from './socks.service';

describe('SocksGateway', () => {
  let gateway: SocksGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocksGateway, SocksService],
    }).compile();

    gateway = module.get<SocksGateway>(SocksGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
