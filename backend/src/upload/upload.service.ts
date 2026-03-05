import { Inject, Injectable } from '@nestjs/common';
import { IStorageProvider, STORAGE_PROVIDER } from '../common/interfaces/storage-provider.interface';

@Injectable()
export class UploadService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  async uploadFile(file: Express.Multer.File, folder: string = 'images'): Promise<string> {
    return this.storageProvider.upload(file, folder);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    return this.storageProvider.delete(fileUrl);
  }
}
