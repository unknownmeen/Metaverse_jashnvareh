import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';
import { User } from '@prisma/client';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => UserModel)
  user: User;
}
