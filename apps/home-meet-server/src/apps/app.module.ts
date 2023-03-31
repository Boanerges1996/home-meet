import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { MongooseConfigService } from '@/mongoose/mongoose';
import configuration from 'src/config/configuration';
import { getEnvPath } from 'src/util';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from '@/jwt';
import { MeetModule } from './meet/meet.module';
import { MeetSocketModule } from './meet-socket/meet-socket.module';

const envFilePath = getEnvPath(`${__dirname}/../envs`);

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: envFilePath,
      isGlobal: true,
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MongooseConfigService,
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useClass: JwtConfigService,
    }),
    UserModule,
    AuthModule,
    MeetModule,
    MeetSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
