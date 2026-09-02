import { Inject, Injectable } from '@nestjs/common';
import type { PageResult } from '@shared/kernel/application/page-result';
import { ApplicationRepository } from '../../domain/repositories/application.repository';
import { APPLICATION_REPOSITORY } from '../../applications.tokens';
import {
  ApplicationWithContextResult,
  ListMyApplicationsQuery,
} from '../dto/application.commands';
import { toApplicationWithContextResult } from '../mappers/application-context.mapper';

@Injectable()
export class ListMyApplicationsUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepository: ApplicationRepository,
  ) {}

  async execute(
    query: ListMyApplicationsQuery,
  ): Promise<PageResult<ApplicationWithContextResult>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.applicationRepository.findByAidantId({
      aidantId: query.aidantId,
      page,
      pageSize,
    });

    return {
      items: result.items.map(toApplicationWithContextResult),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
