import { Injectable } from '@nestjs/common';
import { Image, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Image | null> {
    return this.prisma.image.findUnique({ where: { id } });
  }

  async findByIdWithRelations(id: string) {
    return this.prisma.image.findUnique({
      where: { id },
      include: { user: true, festival: true },
    });
  }

  async findByFestivalId(festivalId: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: { festivalId },
      orderBy: [{ isTopImage: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findByUserId(userId: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.ImageCreateInput): Promise<Image> {
    return this.prisma.image.create({ data });
  }

  async toggleTopImage(id: string, isTopImage: boolean): Promise<Image> {
    return this.prisma.image.update({
      where: { id },
      data: { isTopImage },
    });
  }

  async delete(id: string): Promise<Image> {
    return this.prisma.image.delete({ where: { id } });
  }

  async countComments(imageId: string): Promise<number> {
    return this.prisma.comment.count({ where: { imageId } });
  }
}
