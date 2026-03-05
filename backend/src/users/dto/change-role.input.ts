import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class ChangeRoleInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field(() => String)
  @IsEnum(Role)
  role: Role;
}
