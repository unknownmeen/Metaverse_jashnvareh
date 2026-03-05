import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { UpdateUserInput } from './update-user.input';

@InputType()
export class UpdateUserByIdInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field(() => UpdateUserInput)
  input: UpdateUserInput;
}
