/**
 * Strategy Pattern — IStorageProvider
 *
 * Abstraction for file storage. Implemented by concrete strategies:
 * - LocalStorageStrategy (for development)
 * - Future: S3StorageStrategy, CloudinaryStrategy, etc.
 */
export interface IStorageProvider {
  /**
   * Uploads a file and returns the public URL or path.
   */
  upload(file: Express.Multer.File, folder: string): Promise<string>;

  /**
   * Deletes a file by its URL or path.
   */
  delete(fileUrl: string): Promise<void>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
