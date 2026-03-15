import { Injectable } from '@nestjs/common';
import { Prisma, Rating, RatingCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RatingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByImageAndUser(imageId: string, userId: string, category: RatingCategory): Promise<Rating | null> {
    return this.prisma.rating.findUnique({
      where: { imageId_userId_category: { imageId, userId, category } },
    });
  }

  async upsert(imageId: string, userId: string, score: number, maxScore: number, category: RatingCategory): Promise<Rating> {
    return this.prisma.rating.upsert({
      where: { imageId_userId_category: { imageId, userId, category } },
      update: { score, maxScore },
      create: { score, maxScore, category, imageId, userId },
    });
  }

  async getAverageRating(imageId: string, category: RatingCategory): Promise<{ average: number; count: number }> {
    const result = await this.prisma.rating.aggregate({
      where: { imageId, category },
      _avg: { score: true },
      _count: { score: true },
    });

    return {
      average: result._avg.score ?? 0,
      count: result._count.score,
    };
  }

  async getJudgeAverageRating(imageId: string): Promise<{ average: number; count: number }> {
    return this.getAverageRating(imageId, RatingCategory.JUDGE);
  }

  async create(data: Prisma.RatingCreateInput): Promise<Rating> {
    return this.prisma.rating.create({ data });
  }
}
