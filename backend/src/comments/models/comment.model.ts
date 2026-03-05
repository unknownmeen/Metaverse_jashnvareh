import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';

@ObjectType('Comment')
export class CommentModel {
  @Field(() => ID)
  id: string;

  @Field()
  text: string;

  @Field()
  isAdminReview: boolean;

  @Field()
  imageId: string;

  @Field()
  userId: string;

  @Field(() => UserModel)
  author: UserModel;

  @Field()
  createdAt: Date;
}
