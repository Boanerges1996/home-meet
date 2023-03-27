import { JwtConfigService } from '@/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtUserStrategy } from '../jwt';
import { UserModule } from '../user/user.module';
import { MeetController } from './meet.controller';
import { Meet, MeetSchema } from './meet.model';
import { MeetService } from './meet.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Meet.name,
        useFactory: () => {
          const meetSchema = MeetSchema;

          return meetSchema;
        },
      },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useClass: JwtConfigService,
    }),
    UserModule,
  ],
  controllers: [MeetController],
  providers: [MeetService, JwtUserStrategy],
})
export class MeetModule {}
