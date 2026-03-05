import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadResolver } from './upload.resolver';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { STORAGE_PROVIDER } from '../common/interfaces/storage-provider.interface';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }),
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    UploadResolver,
    {
      provide: STORAGE_PROVIDER,
      useClass: LocalStorageStrategy,
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
