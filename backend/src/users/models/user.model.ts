import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Role, Gender } from '../../common/enums';

@ObjectType('User')
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  phone: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Gender)
  gender: Gender;

  @Field({ nullable: true })
  realName?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  /**
   * visibleName is dynamically resolved by the UserResolver's
   * @ResolveField — Prisma entities won't have this property,
   * so it must be nullable at the model level.
   */
  @Field({ nullable: true, description: 'Resolved author name based on viewer gender context' })
  visibleName?: string;

  @Field()
  createdAt: Date;
}
