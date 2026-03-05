import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FestivalsModule } from './festivals/festivals.module';
import { ImagesModule } from './images/images.module';
import { CommentsModule } from './comments/comments.module';
import { RatingsModule } from './ratings/ratings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // ── Config ─────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Event Emitter (Pub/Sub) ────────────────────────
    EventEmitterModule.forRoot(),

    // ── GraphQL (Code-First with Apollo) ───────────────
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }: { req: any }) => ({ req }),
    }),

    // ── Serve uploaded files as static ─────────────────
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // ── Database ───────────────────────────────────────
    PrismaModule,

    // ── Domain Modules ─────────────────────────────────
    AuthModule,
    UsersModule,
    FestivalsModule,
    ImagesModule,
    CommentsModule,
    RatingsModule,
    NotificationsModule,
    UploadModule,
  ],
})
export class AppModule {}
