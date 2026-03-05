import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UploadImageInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  festivalId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  url: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => [String], { nullable: true, defaultValue: [] })
  @IsOptional()
  tags?: string[];
}
