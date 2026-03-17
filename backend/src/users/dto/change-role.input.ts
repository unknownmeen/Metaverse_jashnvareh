import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class ChangeRoleInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field(() => String)
  @IsEnum(Role)
  role: Role;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  judgeLevel?: number;
}
