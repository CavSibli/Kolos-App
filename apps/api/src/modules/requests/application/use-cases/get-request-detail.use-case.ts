import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestRepository } from '../../domain/repositories/request.repository';
import { REQUEST_REPOSITORY } from '../../requests.tokens';
import { RequestWithStatsResult } from '../dto/request.commands';
import { toRequestResult } from '../mappers/request-result.mapper';
import { CandidatureOrmEntity } from '@modules/applications/infrastructure/typeorm/entities/candidature.orm-entity';
import { MissionOrmEntity } from '@modules/missions/infrastructure/typeorm/entities/mission.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { STATUS_LOOKUP } from '@shared/reference-data/reference-data.tokens';
import type { StatusLookupPort } from '@shared/reference-data/application/ports/status-lookup.port';
import { MissionOrmMapper } from '@modules/missions/infrastructure/typeorm/mappers/mission.orm-mapper';

@Injectable()
export class GetRequestDetailUseCase {
  constructor(
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
    @InjectRepository(CandidatureOrmEntity)
    private readonly candidatureRepo: Repository<CandidatureOrmEntity>,
    @Inject(STATUS_LOOKUP)
    private readonly statusLookup: StatusLookupPort,
  ) {}

  async execute(
    demandeId: number,
    demandeurId: string,
  ): Promise<RequestWithStatsResult> {
    const request = await this.requestRepository.findById(demandeId);
    if (!request) {
      throw new NotFoundException('Demande introuvable');
    }

    if (request.demandeurId !== demandeurId) {
      throw new ForbiddenException('Accès non autorisé à cette demande');
    }

    const pendingId = await this.statusLookup.getCandidatureStatusId('PENDING');
    const acceptedId =
      await this.statusLookup.getCandidatureStatusId('ACCEPTED');

    const pendingApplications = await this.candidatureRepo.count({
      where: { demandeId, statutCandidatureId: pendingId },
    });
    const acceptedApplications = await this.candidatureRepo.count({
      where: { demandeId, statutCandidatureId: acceptedId },
    });

    const missionEntity = await this.candidatureRepo.manager.findOne(
      MissionOrmEntity,
      {
        where: { demandeId },
        relations: ['statutMission'],
      },
    );

    return {
      ...toRequestResult(request),
      pendingApplications,
      acceptedApplications,
      mission: missionEntity
        ? {
            id: missionEntity.id,
            status: MissionOrmMapper.toDomain(missionEntity).statusCode,
            montantTotal: Number(missionEntity.montantTotal),
          }
        : null,
    };
  }
}
