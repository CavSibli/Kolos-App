import { Inject, Injectable } from '@nestjs/common';
import type { PageResult } from '@shared/kernel/application/page-result';
import { RequestRepository } from '../../domain/repositories/request.repository';
import { REQUEST_REPOSITORY } from '../../requests.tokens';
import {
  ListMyRequestsQuery,
  RequestWithStatsResult,
} from '../dto/request.commands';
import { toRequestResult } from '../mappers/request-result.mapper';

@Injectable()
export class ListMyRequestsUseCase {
  constructor(
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
  ) {}

  async execute(
    query: ListMyRequestsQuery,
  ): Promise<PageResult<RequestWithStatsResult>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.requestRepository.findByDemandeurId({
      demandeurId: query.demandeurId,
      page,
      pageSize,
    });

    return {
      items: result.items.map((item) => ({
        ...toRequestResult(item.request),
        pendingApplications: item.pendingApplications,
        acceptedApplications: item.acceptedApplications,
        mission: item.mission
          ? {
              id: item.mission.id!,
              status: item.mission.statusCode,
              montantTotal: item.mission.montantTotal,
            }
          : null,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
