import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { FestivalModel } from '../models/festival.model';
import { FestivalReadService } from '../services/festival-read.service';
import { FestivalWriteService } from '../services/festival-write.service';
import { CreateFestivalInput } from '../dto/create-festival.input';
import { UpdateFestivalStatusInput } from '../dto/update-festival-status.input';
import { GqlAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

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
  async festival(@Args('id', { type: () => ID }) id: string) {
    return this.festivalReadService.findById(id);
  }

  @Mutation(() => FestivalModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createFestival(@Args('input') input: CreateFestivalInput) {
    return this.festivalWriteService.create(input);
  }

  /**
   * Updates festival status through the State Machine.
   * Only ADMIN can invoke this. The state machine enforces
   * valid transitions: UNOPENED -> OPEN -> CLOSED.
   */
  @Mutation(() => FestivalModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateFestivalStatus(@Args('input') input: UpdateFestivalStatusInput) {
    return this.festivalWriteService.updateStatus(input.festivalId, input.newStatus);
  }

  @ResolveField('imageCount', () => Number)
  async resolveImageCount(@Parent() festival: { id: string }): Promise<number> {
    return this.festivalReadService.getImageCount(festival.id);
  }
}
