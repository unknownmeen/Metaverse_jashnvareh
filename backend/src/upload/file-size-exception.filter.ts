import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

const FILE_SIZE_ERROR_FA = 'حجم فایل بیش از حد مجاز است. حداکثر حجم مجاز ۱۰ مگابایت می‌باشد.';

@Catch(MulterError)
export class FileSizeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(FileSizeExceptionFilter.name);

  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 'LIMIT_FILE_SIZE') {
      this.logger.warn(`File size limit exceeded`);
      response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        statusCode: 413,
        message: FILE_SIZE_ERROR_FA,
        error: 'Payload Too Large',
      });
    } else {
      throw exception;
    }
  }
}
