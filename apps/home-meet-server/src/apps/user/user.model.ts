import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

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
  collection: 'user',
})
export class User {
  @Prop()
  name?: string;

  @Prop({
    required: true,
    unique: true,
    sparse: true,
  })
  email: string;

  @Prop({
    default: [
      'https://phubie-staging.s3.amazonaws.com/admin/avatar/default/administrator.png',
      'https://phubie-staging.s3.amazonaws.com/admin/avatar/default/administrator1.png',
      'https://phubie-staging.s3.amazonaws.com/admin/avatar/default/administrator2.png',
      'https://phubie-staging.s3.amazonaws.com/admin/avatar/default/administrator3.png',
      'https://phubie-staging.s3.amazonaws.com/admin/avatar/default/administrator4.png',
    ].at(Math.random() * 5),
  })
  pic: string;

  @Prop({
    unique: true,
    sparse: true,
  })
  phone?: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  password: string;

  validatePassword: (password: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.validatePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};
