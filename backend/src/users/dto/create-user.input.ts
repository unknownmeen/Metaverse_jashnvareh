import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Gender, Role } from '@prisma/client';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل معتبر نیست' })
  phone: string;

  @Field()
  @IsString()
  @MinLength(6, { message: 'رمز عبور حداقل ۶ کاراکتر باشد' })
  password: string;

  @Field(() => String)
  @IsEnum(Role)
  role: Role;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  realName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;
}
