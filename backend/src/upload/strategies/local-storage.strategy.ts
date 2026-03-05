import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageProvider } from '../../common/interfaces/storage-provider.interface';

/**
 * Local File System storage strategy.
 * Implements IStorageProvider for development / on-premise deployments.
 */
@Injectable()
export class LocalStorageStrategy implements IStorageProvider {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const targetDir = path.join(this.uploadDir, folder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    // Return a relative URL that the frontend can access
    return `/uploads/${folder}/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    // Convert URL back to file path
    const filePath = path.join(this.uploadDir, fileUrl.replace('/uploads/', ''));

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
