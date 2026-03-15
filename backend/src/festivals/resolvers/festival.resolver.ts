import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { FestivalModel } from '../models/festival.model';
import { FestivalReadService } from '../services/festival-read.service';
import { FestivalWriteService } from '../services/festival-write.service';
import { CreateFestivalInput } from '../dto/create-festival.input';
import { UpdateFestivalInput } from '../dto/update-festival.input';
import { UpdateFestivalStatusInput } from '../dto/update-festival-status.input';
import { GqlAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';

@Resolver(() => FestivalModel)
export class FestivalResolver {
  constructor(
    private readonly festivalReadService: FestivalReadService,
    private readonly festivalWriteService: FestivalWriteService,
  ) {}

  @Query(() => [FestivalModel], { name: 'festivals' })
  @UseGuards(GqlAuthGuard)
  async festivals() {
    return this.festivalReadService.findAll();
  }

  @Query(() => FestivalModel, { name: 'festival' })
  @UseGuards(GqlAuthGuard)
  async festival(@Args('idOrSlug', { type: () => String }) idOrSlug: string) {
    return this.festivalReadService.findByIdOrSlug(idOrSlug);
  }

  @Mutation(() => FestivalModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createFestival(@CurrentUser() user: User, @Args('input') input: CreateFestivalInput) {
    return this.festivalWriteService.create(user.id, input);
  }

  @Mutation(() => FestivalModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async updateFestival(@CurrentUser() user: User, @Args('input') input: UpdateFestivalInput) {
    return this.festivalWriteService.update(user.id, input);
  }

  /**
   * Updates festival status through the State Machine.
   * Only ADMIN can invoke this. The state machine enforces
   * valid transitions: UNOPENED -> OPEN -> CLOSED.
   */
  @Mutation(() => FestivalModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async updateFestivalStatus(@CurrentUser() user: User, @Args('input') input: UpdateFestivalStatusInput) {
    return this.festivalWriteService.updateStatus(user.id, input.festivalId, input.newStatus);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async deleteFestival(@CurrentUser() user: User, @Args('festivalId', { type: () => ID }) festivalId: string) {
    return this.festivalWriteService.delete(user.id, festivalId);
  }

  @ResolveField('imageCount', () => Number)
  async resolveImageCount(@Parent() festival: { id: string }): Promise<number> {
    return this.festivalReadService.getImageCount(festival.id);
  }
}
