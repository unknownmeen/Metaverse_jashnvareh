import { registerEnumType } from '@nestjs/graphql';
import { FestivalStatus as PrismaFestivalStatus } from '@prisma/client';

export { PrismaFestivalStatus as FestivalStatus };

registerEnumType(PrismaFestivalStatus, { name: 'FestivalStatus' });
