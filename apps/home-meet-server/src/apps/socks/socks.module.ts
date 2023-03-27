import { Module } from '@nestjs/common';
import { SocksService } from './socks.service';
import { SocksGateway } from './socks.gateway';

@Module({
  providers: [SocksGateway, SocksService],
})
export class SocksModule {}
