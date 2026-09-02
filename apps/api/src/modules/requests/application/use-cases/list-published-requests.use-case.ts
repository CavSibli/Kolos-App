import { Inject, Injectable } from '@nestjs/common';
import type { PageResult } from '@shared/kernel/application/page-result';
import { RequestRepository } from '../../domain/repositories/request.repository';
import { REQUEST_REPOSITORY } from '../../requests.tokens';
import {
  ListPublishedRequestsQuery,
  RequestResult,
} from '../dto/request.commands';
import { Request } from '../../domain/entities/request.entity';

@Injectable()
export class ListPublishedRequestsUseCase {
  constructor(
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
  ) {}

  async execute(
    query: ListPublishedRequestsQuery,
  ): Promise<PageResult<RequestResult>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.requestRepository.findPublished({
      page,
      pageSize,
    });

    return {
      items: result.items.map((request) => this.toResult(request)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  private toResult(request: Request): RequestResult {
    return {
      id: request.id!,
      demandeurId: request.demandeurId,
      status: request.statusCode,
      titre: request.titre,
      description: request.description,
      contraintesPhysiques: request.contraintesPhysiques,
      adresse: request.adresse,
      latitude: request.latitude,
      longitude: request.longitude,
      dateMission: request.dateMission.toISOString(),
      dureeEstimee: request.dureeEstimee,
      nbAidantsRequis: request.nbAidantsRequis,
      budgetEstime: request.budgetEstime,
      createdAt: request.createdAt.toISOString(),
    };
  }
}
