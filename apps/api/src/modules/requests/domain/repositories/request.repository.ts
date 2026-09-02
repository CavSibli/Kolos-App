import { Request } from '../entities/request.entity';
import type { PageResult } from '@shared/kernel/application/page-result';

export interface FindPublishedOptions {
  page: number;
  pageSize: number;
}

export interface RequestRepository {
  save(request: Request): Promise<Request>;
  findById(id: number): Promise<Request | null>;
  findPublished(options: FindPublishedOptions): Promise<PageResult<Request>>;
}
