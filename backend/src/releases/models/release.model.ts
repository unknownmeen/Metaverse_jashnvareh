import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Release')
export class ReleaseModel {
  @Field(() => ID)
  id: string;

  @Field()
  version: string;

  @Field()
  published: boolean;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field(() => [String])
  features: string[];

  @Field(() => [String])
  improvements: string[];

  @Field(() => [String])
  bugFixes: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
