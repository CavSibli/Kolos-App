import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationRepository } from '../../domain/repositories/application.repository';
import { RequestRepository } from '@modules/requests/domain/repositories/request.repository';
import { APPLICATION_REPOSITORY } from '../../applications.tokens';
import { REQUEST_REPOSITORY } from '@modules/requests/requests.tokens';
import {
  CandidateResult,
  ListRequestApplicationsQuery,
} from '../dto/application.commands';

@Injectable()
export class ListRequestApplicationsUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepository: ApplicationRepository,
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
  ) {}

  async execute(query: ListRequestApplicationsQuery): Promise<CandidateResult[]> {
    const request = await this.requestRepository.findById(query.demandeId);
    if (!request) {
      throw new NotFoundException('Demande introuvable');
    }

    if (request.demandeurId !== query.demandeurId) {
      throw new ForbiddenException('Accès non autorisé à cette demande');
    }

    const candidates = await this.applicationRepository.findByDemandeId(
      query.demandeId,
    );

    return candidates.map((candidate) => ({
      applicationId: candidate.application.id!,
      status: candidate.application.statusCode,
      message: candidate.application.message,
      prixPropose: candidate.application.prixPropose,
      createdAt: candidate.application.createdAt.toISOString(),
      aidant: candidate.aidant,
    }));
  }
}
