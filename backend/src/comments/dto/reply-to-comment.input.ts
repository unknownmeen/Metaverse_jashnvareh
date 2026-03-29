import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ReplyToCommentInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  imageId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  parentCommentId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  text: string;
}
