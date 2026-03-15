import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayNotEmpty, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class UploadImageInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  festivalId: string;

  @Field(() => [String])
  @ArrayNotEmpty()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  urls: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  @Max(2)
  coverIndex: number;

  @Field(() => [String], { nullable: true, defaultValue: [] })
  @IsOptional()
  tags?: string[];
}
