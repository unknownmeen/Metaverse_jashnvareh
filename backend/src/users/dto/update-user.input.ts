import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Matches } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل معتبر نیست' })
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  realName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;
}
