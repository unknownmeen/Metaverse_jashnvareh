import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';

import { Roles } from '../../common/decorators';
import { GqlAuthGuard, RolesGuard } from '../../common/guards';
import { CreateReleaseInput } from '../dto/create-release.input';
import { UpdateReleaseInput } from '../dto/update-release.input';
import { ReleaseModel } from '../models/release.model';
import { ReleaseService } from '../services/release.service';

@Resolver(() => ReleaseModel)
export class ReleaseResolver {
  constructor(private readonly releaseService: ReleaseService) {}

  @Query(() => [ReleaseModel])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async releases() {
    return this.releaseService.findAll();
  }

  @Query(() => [ReleaseModel])
  @UseGuards(GqlAuthGuard)
  async publishedReleases() {
    return this.releaseService.findPublished();
  }

  @Query(() => ReleaseModel, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async latestPublishedRelease() {
    return this.releaseService.findLatestPublished();
  }

  @Query(() => ReleaseModel, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async release(@Args('version', { type: () => String }) version: string) {
    return this.releaseService.findByVersion(version);
  }

  @Mutation(() => ReleaseModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async createRelease(@Args('input') input: CreateReleaseInput) {
    return this.releaseService.create({
      version: input.version,
      published: input.published,
      features: input.features,
      improvements: input.improvements,
      bugFixes: input.bugFixes,
    });
  }

  @Mutation(() => ReleaseModel, { nullable: true })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async updateRelease(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateReleaseInput,
  ) {
    return this.releaseService.update(id, {
      version: input.version,
      published: input.published,
      features: input.features,
      improvements: input.improvements,
      bugFixes: input.bugFixes,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async deleteRelease(@Args('id', { type: () => String }) id: string) {
    await this.releaseService.delete(id);
    return true;
  }
}
