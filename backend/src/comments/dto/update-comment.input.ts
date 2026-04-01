import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

@InputType()
export class UpdateCommentInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  commentId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'متن نظر باید حداقل ۵ کاراکتر باشد' })
  text: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  ratingScore?: number | null;
}
