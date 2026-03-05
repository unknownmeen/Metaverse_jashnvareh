import { Injectable } from '@nestjs/common';
import { Prisma, Rating } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RatingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByImageAndUser(imageId: string, userId: string): Promise<Rating | null> {
    return this.prisma.rating.findUnique({
      where: { imageId_userId: { imageId, userId } },
    });
  }

  async upsert(imageId: string, userId: string, score: number): Promise<Rating> {
    return this.prisma.rating.upsert({
      where: { imageId_userId: { imageId, userId } },
      update: { score },
      create: { score, imageId, userId },
    });
  }

  async getAverageRating(imageId: string): Promise<{ average: number; count: number }> {
    const result = await this.prisma.rating.aggregate({
      where: { imageId },
      _avg: { score: true },
      _count: { score: true },
    });

    return {
      average: result._avg.score ?? 0,
      count: result._count.score,
    };
  }

  async create(data: Prisma.RatingCreateInput): Promise<Rating> {
    return this.prisma.rating.create({ data });
  }
}
