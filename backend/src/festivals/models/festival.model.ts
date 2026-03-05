import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { FestivalStatus } from '../../common/enums';
import { ConceptMediaType } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(ConceptMediaType, { name: 'ConceptMediaType' });

@ObjectType('Festival')
export class FestivalModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field(() => ConceptMediaType)
  conceptMediaType: ConceptMediaType;

  @Field({ nullable: true })
  conceptMediaUrl?: string;

  @Field({ nullable: true })
  conceptText?: string;

  @Field({ nullable: true })
  rulesText?: string;

  @Field(() => FestivalStatus)
  status: FestivalStatus;

  @Field(() => Int)
  imageCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
