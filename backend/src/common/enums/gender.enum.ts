import { registerEnumType } from '@nestjs/graphql';
import { Gender as PrismaGender } from '@prisma/client';

export { PrismaGender as Gender };

registerEnumType(PrismaGender, { name: 'Gender' });
