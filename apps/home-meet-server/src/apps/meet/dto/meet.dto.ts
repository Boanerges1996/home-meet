import { IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMeetDto {
  @IsString()
  title: string;

  @IsMongoId()
  creator: Types.ObjectId;
}
