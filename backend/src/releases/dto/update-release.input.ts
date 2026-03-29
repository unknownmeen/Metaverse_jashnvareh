import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

@InputType()
export class UpdateReleaseInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'شماره نسخه باید به فرمت X.Y.Z باشد (مثال: 1.2.0)',
  })
  version?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  improvements?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bugFixes?: string[];
}
