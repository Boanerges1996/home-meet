import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
  });

  const configService = app.get(ConfigService);
  const port = configService.get('port');
  const globalPrefix = configService.get('globalPrefix');

  app.enableCors();
  app.setGlobalPrefix(globalPrefix);
  await app.listen(port);
}
bootstrap();
