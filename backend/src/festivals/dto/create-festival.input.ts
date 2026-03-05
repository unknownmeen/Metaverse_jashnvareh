import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ConceptMediaType } from '@prisma/client';

@InputType()
export class CreateFestivalInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @Field(() => String, { nullable: true, defaultValue: 'IMAGE' })
  @IsOptional()
  conceptMediaType?: ConceptMediaType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  conceptMediaUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  conceptText?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rulesText?: string;
}
