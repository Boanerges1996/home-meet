import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtOptionsFactory, JwtModuleOptions } from '@nestjs/jwt';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    const jwtSecret = this.configService.get<string>('jwt.secret');
    const jwtExpiresIn = this.configService.get<string>('jwt.expiresIn');

    return {
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    };
  }
}
