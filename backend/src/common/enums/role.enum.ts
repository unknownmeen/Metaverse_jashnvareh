import { registerEnumType } from '@nestjs/graphql';
import { Role as PrismaRole } from '@prisma/client';

export { PrismaRole as Role };

registerEnumType(PrismaRole, { name: 'Role' });
