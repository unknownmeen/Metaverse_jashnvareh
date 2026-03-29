import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}
