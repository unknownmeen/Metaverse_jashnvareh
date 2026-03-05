import { Injectable } from '@nestjs/common';
import { Comment, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  async findByImageId(imageId: string): Promise<(Comment & { user: any })[]> {
    return this.prisma.comment.findMany({
      where: { imageId },
      include: { user: true },
      orderBy: [{ isAdminReview: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return this.prisma.comment.create({ data });
  }

  async delete(id: string): Promise<Comment> {
    return this.prisma.comment.delete({ where: { id } });
  }
}
