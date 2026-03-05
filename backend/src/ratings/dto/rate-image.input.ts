import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

@InputType()
export class RateImageInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  imageId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;
}
