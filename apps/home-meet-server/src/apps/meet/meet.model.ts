import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.model';

export type MeetDocument = Meet & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
    getters: true,
  },
  optimisticConcurrency: true,
  collection: 'meet',
})
export class Meet {
  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
    ref: User.name,
  })
  creator: Types.ObjectId;

  @Prop({
    ref: User.name,
  })
  attendees: Types.ObjectId[];
}

export const MeetSchema = SchemaFactory.createForClass(Meet);

MeetSchema.methods.validatePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};
