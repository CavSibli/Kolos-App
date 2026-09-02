import { Inject, Injectable } from '@nestjs/common';
import type { PageResult } from '@shared/kernel/application/page-result';
import { RequestRepository } from '../../domain/repositories/request.repository';
import { REQUEST_REPOSITORY } from '../../requests.tokens';
import {
  ListPublishedRequestsQuery,
  PublishedRequestResult,
} from '../dto/request.commands';
import { toRequestResult } from '../mappers/request-result.mapper';

@Injectable()
export class ListPublishedRequestsUseCase {
  constructor(
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
  ) {}

  async execute(
    query: ListPublishedRequestsQuery,
  ): Promise<PageResult<PublishedRequestResult>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.requestRepository.findPublished({
      page,
      pageSize,
      aidantId: query.aidantId,
    });

    return {
      items: result.items.map((item) => ({
        ...toRequestResult(item.request),
        myApplicationStatus: item.myApplicationStatus,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
