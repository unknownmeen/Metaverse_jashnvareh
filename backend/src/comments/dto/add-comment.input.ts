import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class AddCommentInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  imageId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  text: string;
}
