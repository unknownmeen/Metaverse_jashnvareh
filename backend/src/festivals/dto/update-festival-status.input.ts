import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { FestivalStatus } from '../../common/enums';

@InputType()
export class UpdateFestivalStatusInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  festivalId: string;

  @Field(() => FestivalStatus)
  @IsNotEmpty()
  newStatus: FestivalStatus;
}
