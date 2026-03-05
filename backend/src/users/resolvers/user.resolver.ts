import { Resolver, Query, Mutation, Args, ResolveField, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { UserModel } from '../models/user.model';
import { UserReadService } from '../services/user-read.service';
import { UserWriteService } from '../services/user-write.service';
import { UpdateProfileInput } from '../dto/update-profile.input';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserByIdInput } from '../dto/update-user-by-id.input';
import { ChangeRoleInput } from '../dto/change-role.input';
import { GqlAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';

@Resolver(() => UserModel)
export class UserResolver {
  constructor(
    private readonly userReadService: UserReadService,
    private readonly userWriteService: UserWriteService,
  ) {}

  @Mutation(() => UserModel)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    return this.userWriteService.updateProfile(user.id, input);
  }

  @Query(() => [UserModel])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async allUsers(): Promise<User[]> {
    return this.userReadService.findAll();
  }

  @Mutation(() => [UserModel])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async createUsers(@Args('inputs', { type: () => [CreateUserInput] }) inputs: CreateUserInput[]): Promise<User[]> {
    return this.userWriteService.createUsers(inputs);
  }

  @Mutation(() => [UserModel])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async updateUsers(
    @Args('updates', { type: () => [UpdateUserByIdInput] }) updates: UpdateUserByIdInput[],
  ): Promise<User[]> {
    return this.userWriteService.updateUsers(updates);
  }

  @Mutation(() => [UserModel])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async changeRoles(
    @Args('changes', { type: () => [ChangeRoleInput] }) changes: ChangeRoleInput[],
  ): Promise<User[]> {
    return this.userWriteService.changeRoles(changes);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async deleteUsers(@Args('ids', { type: () => [String] }) ids: string[]): Promise<boolean> {
    await this.userWriteService.deleteUsers(ids);
    return true;
  }

  /**
   * ── Gender-Based Name Masking (Dynamic Field Resolver) ──
   *
   * This is the CORE business rule. The `visibleName` field is
   * resolved dynamically based on BOTH the viewer's and author's gender:
   *
   *   Viewer = FEMALE → sees realName of EVERYONE.
   *   Viewer = MALE  → sees realName of males, displayName of females.
   *   Self-view      → females see their own displayName.
   *
   * The underlying services/repositories stay completely clean —
   * all gender masking happens here at the resolver level.
   */
  @ResolveField('visibleName', () => String)
  resolveVisibleName(
    @Parent() author: User,
    @Context() ctx: { req: { user?: User } },
  ): string {
    const viewer = ctx.req?.user;

    const fallback = author.realName ?? author.displayName ?? 'کاربر';

    // Unauthenticated or no viewer context: show displayName for females, realName for males
    if (!viewer) {
      if (author.gender === 'FEMALE' && author.displayName) {
        return author.displayName;
      }
      return fallback;
    }

    // Rule 1: Self-view — female sees her own displayName
    if (viewer.id === author.id && author.gender === 'FEMALE') {
      return author.displayName ?? author.realName ?? 'کاربر';
    }

    // Rule 2: Female viewer sees realName of ALL users
    if (viewer.gender === 'FEMALE') {
      return author.realName ?? author.displayName ?? 'کاربر';
    }

    // Rule 3: Male viewer sees displayName of females
    if (author.gender === 'FEMALE' && author.displayName) {
      return author.displayName;
    }

    // Rule 4: Male viewer sees realName of males
    return author.realName ?? author.displayName ?? 'کاربر';
  }
}
