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
    const ratings = await this.prisma.rating.findMany({
      where: { imageId, category: RatingCategory.JUDGE },
      select: {
        score: true,
        user: { select: { judgeLevel: true } },
      },
    });

    if (ratings.length === 0) {
      return { average: 0, count: 0 };
    }

    let weightedSum = 0;
    let totalWeight = 0;
    for (const rating of ratings) {
      const rawWeight = rating.user?.judgeLevel ?? 1;
      const weight = Math.min(10, Math.max(1, rawWeight));
      weightedSum += rating.score * weight;
      totalWeight += weight;
    }

    return {
      average: totalWeight > 0 ? weightedSum / totalWeight : 0,
      count: ratings.length,
    };
  }

  async create(data: Prisma.RatingCreateInput): Promise<Rating> {
    return this.prisma.rating.create({ data });
  }
}
