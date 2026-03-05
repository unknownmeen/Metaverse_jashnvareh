import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../common/guards';
import { UploadService } from './upload.service';

// Note: For GraphQL file uploads, the frontend typically
// uploads files via a REST endpoint and sends the resulting URL
// in the GraphQL mutation. This resolver provides a placeholder
// for direct file URL management.

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  // File uploads are handled via REST (POST /upload)
  // and the returned URL is used in GraphQL mutations.
}
