import { Injectable } from '@nestjs/common';
import { Festival, FestivalStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FestivalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Festival | null> {
    return this.prisma.festival.findUnique({ where: { id } });
  }

  async findMany(args?: Prisma.FestivalFindManyArgs): Promise<Festival[]> {
    return this.prisma.festival.findMany(args);
  }

  async findAll(): Promise<Festival[]> {
    return this.prisma.festival.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: Prisma.FestivalCreateInput): Promise<Festival> {
    return this.prisma.festival.create({ data });
  }

  async updateStatus(id: string, status: FestivalStatus): Promise<Festival> {
    return this.prisma.festival.update({
      where: { id },
      data: { status },
    });
  }

  async update(id: string, data: Prisma.FestivalUpdateInput): Promise<Festival> {
    return this.prisma.festival.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Festival> {
    return this.prisma.festival.delete({ where: { id } });
  }

  async countImages(festivalId: string): Promise<number> {
    return this.prisma.image.count({ where: { festivalId } });
  }
}
