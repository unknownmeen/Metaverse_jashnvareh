import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReleaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.release.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublished() {
    return this.prisma.release.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findLatestPublished() {
    return this.prisma.release.findFirst({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findByVersion(version: string) {
    return this.prisma.release.findUnique({
      where: { version },
    });
  }

  async create(data: {
    version: string;
    published?: boolean;
    features?: string[];
    improvements?: string[];
    bugFixes?: string[];
  }) {
    const publishedAt = data.published ? new Date() : null;

    return this.prisma.release.create({
      data: {
        version: data.version,
        published: data.published ?? false,
        publishedAt,
        features: data.features?.filter((item) => item.trim()) ?? [],
        improvements: data.improvements?.filter((item) => item.trim()) ?? [],
        bugFixes: data.bugFixes?.filter((item) => item.trim()) ?? [],
      },
    });
  }

  async update(
    id: string,
    data: {
      version?: string;
      published?: boolean;
      features?: string[];
      improvements?: string[];
      bugFixes?: string[];
    },
  ) {
    const existing = await this.prisma.release.findUnique({ where: { id } });
    if (!existing) return null;

    const publishedAt =
      data.published === true
        ? (existing.publishedAt ?? new Date())
        : data.published === false
          ? null
          : existing.publishedAt;

    return this.prisma.release.update({
      where: { id },
      data: {
        ...(data.version !== undefined && { version: data.version }),
        ...(data.published !== undefined && { published: data.published }),
        ...(publishedAt !== undefined && { publishedAt }),
        ...(data.features !== undefined && { features: data.features.filter((item) => item.trim()) }),
        ...(data.improvements !== undefined && { improvements: data.improvements.filter((item) => item.trim()) }),
        ...(data.bugFixes !== undefined && { bugFixes: data.bugFixes.filter((item) => item.trim()) }),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.release.delete({ where: { id } });
  }
}
