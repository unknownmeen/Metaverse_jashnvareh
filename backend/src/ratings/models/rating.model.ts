import { Field, ID, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType('Rating')
export class RatingModel {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  score: number;

  @Field()
  imageId: string;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;
}

@ObjectType('AverageRating')
export class AverageRatingModel {
  @Field(() => Float)
  average: number;

  @Field(() => Int)
  count: number;
}
