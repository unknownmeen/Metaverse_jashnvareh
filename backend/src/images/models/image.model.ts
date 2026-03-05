import { Field, ID, ObjectType, Float } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';
import { FestivalModel } from '../../festivals/models/festival.model';

@ObjectType('Image')
export class ImageModel {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  isTopImage: boolean;

  @Field(() => [String])
  tags: string[];

  @Field()
  festivalId: string;

  @Field()
  userId: string;

  @Field(() => UserModel)
  author: UserModel;

  @Field(() => FestivalModel, { nullable: true })
  festival?: FestivalModel;

  @Field(() => Float, { nullable: true })
  averageRating?: number;

  @Field()
  commentCount: number;

  @Field()
  createdAt: Date;
}
