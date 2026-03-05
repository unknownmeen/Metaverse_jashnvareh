import { registerEnumType } from '@nestjs/graphql';
import { NotificationType as PrismaNotificationType } from '@prisma/client';

export { PrismaNotificationType as NotificationType };

registerEnumType(PrismaNotificationType, { name: 'NotificationType' });
