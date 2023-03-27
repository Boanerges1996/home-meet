import { Field } from '@nestjs/graphql';

export class BaseError {
  @Field(() => String, { nullable: false })
  message: string;
}

export class UserExistsError extends BaseError {}
