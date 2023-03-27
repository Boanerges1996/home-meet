import { Module } from '@nestjs/common';
import { MeetService } from './meet.service';
import { MeetController } from './meet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Meet, MeetSchema } from './meet.model';

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
  ],
  controllers: [MeetController],
  providers: [MeetService],
})
export class MeetModule {}
