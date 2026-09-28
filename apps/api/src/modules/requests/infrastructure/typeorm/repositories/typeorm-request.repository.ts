import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  PublishedRequestItem,
  RequestRepository,
  RequestWithStats,
} from '../../../domain/repositories/request.repository';
import { Request } from '../../../domain/entities/request.entity';
import { DemandeOrmEntity } from '../entities/demande.orm-entity';
import { RequestOrmMapper } from '../mappers/request.orm-mapper';
import { STATUS_LOOKUP } from '@shared/reference-data/reference-data.tokens';
import type { StatusLookupPort } from '@shared/reference-data/application/ports/status-lookup.port';
import type { PageResult } from '@shared/kernel/application/page-result';
import { CandidatureOrmEntity } from '@modules/applications/infrastructure/typeorm/entities/candidature.orm-entity';
import { MissionOrmEntity } from '@modules/missions/infrastructure/typeorm/entities/mission.orm-entity';
import { MissionOrmMapper } from '@modules/missions/infrastructure/typeorm/mappers/mission.orm-mapper';

@Injectable()
export class TypeOrmRequestRepository implements RequestRepository {
  constructor(
    @InjectRepository(DemandeOrmEntity)
    private readonly demandeRepo: Repository<DemandeOrmEntity>,
    @Inject(STATUS_LOOKUP)
    private readonly statusLookup: StatusLookupPort,
  ) {}

  async save(request: Request): Promise<Request> {
    const statutId = await this.statusLookup.getDemandeStatusId(
      request.statusCode,
    );
    const partial = RequestOrmMapper.toOrm(request, statutId);
    let entity = partial.id
      ? await this.demandeRepo.findOne({
          where: { id: partial.id },
          relations: ['statutDemande'],
        })
      : null;

    let savedId: number;
    if (!entity) {
      const created = this.demandeRepo.create(partial);
      const saved = await this.demandeRepo.save(created);
      savedId = saved.id;
    } else {
      // Persist all mutable fields (status-only update broke admin PATCH / withDetails).
      await this.demandeRepo.update(entity.id, {
        statutDemandeId: partial.statutDemandeId,
        titre: partial.titre,
        description: partial.description,
        contraintesPhysiques: partial.contraintesPhysiques,
        adresse: partial.adresse,
        latitude: partial.latitude,
        longitude: partial.longitude,
        dateMission: partial.dateMission,
        dureeEstimee: partial.dureeEstimee,
        nbAidantsRequis: partial.nbAidantsRequis,
        budgetEstime: partial.budgetEstime,
        dateMaj: partial.dateMaj,
      });
      // #region agent log
      try {
        const fs = await import('fs');
        fs.appendFileSync(
          'C:/Users/sibli.cav/OneDrive - Ouidou Consulting/Bureau/3WA-KOLOS/debug-081765.log',
          `${JSON.stringify({
            sessionId: '081765',
            runId: 'post-fix',
            hypothesisId: 'H6',
            location: 'TypeOrmRequestRepository.save',
            message: 'demande update with full fields',
            data: {
              id: entity.id,
              titre: partial.titre,
              descriptionLen: partial.description?.length ?? 0,
              adresseLen: partial.adresse?.length ?? 0,
            },
            timestamp: Date.now(),
          })}\n`,
        );
      } catch {
        /* ignore */
      }
      // #endregion
      savedId = entity.id;
    }

    const reloaded = await this.demandeRepo.findOneOrFail({
      where: { id: savedId },
      relations: ['statutDemande'],
    });

    return RequestOrmMapper.toDomain(reloaded);
  }

  async findById(id: number): Promise<Request | null> {
    const entity = await this.demandeRepo.findOne({
      where: { id },
      relations: ['statutDemande'],
    });
    return entity ? RequestOrmMapper.toDomain(entity) : null;
  }

  async findPublished(options: {
    page: number;
    pageSize: number;
    aidantId?: string;
  }): Promise<PageResult<PublishedRequestItem>> {
    const publishedId = await this.statusLookup.getDemandeStatusId('PUBLISHED');
    const partialId =
      await this.statusLookup.getDemandeStatusId('PARTIALLY_ASSIGNED');

    const [entities, total] = await this.demandeRepo.findAndCount({
      where: { statutDemandeId: In([publishedId, partialId]) },
      relations: ['statutDemande'],
      order: { dateMission: 'ASC' },
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
    });

    let statusMap = new Map<number, string>();
    if (options.aidantId && entities.length > 0) {
      const candidatures = await this.demandeRepo.manager.find(
        CandidatureOrmEntity,
        {
          where: {
            demandeId: In(entities.map((entity) => entity.id)),
            aidantId: options.aidantId,
          },
          relations: ['statutCandidature'],
        },
      );
      statusMap = new Map(
        candidatures.map((c) => [c.demandeId, c.statutCandidature.code]),
      );
    }

    return {
      items: entities.map((entity) => ({
        request: RequestOrmMapper.toDomain(entity),
        myApplicationStatus: (statusMap.get(entity.id) as PublishedRequestItem['myApplicationStatus']) ?? null,
      })),
      total,
      page: options.page,
      pageSize: options.pageSize,
    };
  }

  async findByDemandeurId(options: {
    demandeurId: string;
    page: number;
    pageSize: number;
  }): Promise<PageResult<RequestWithStats>> {
    const [entities, total] = await this.demandeRepo.findAndCount({
      where: { demandeurId: options.demandeurId },
      relations: ['statutDemande'],
      order: { dateCreation: 'DESC' },
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
    });

    const pendingId = await this.statusLookup.getCandidatureStatusId('PENDING');
    const acceptedId =
      await this.statusLookup.getCandidatureStatusId('ACCEPTED');

    const items: RequestWithStats[] = [];
    for (const entity of entities) {
      const pendingApplications = await this.demandeRepo.manager.count(
        CandidatureOrmEntity,
        { where: { demandeId: entity.id, statutCandidatureId: pendingId } },
      );
      const acceptedApplications = await this.demandeRepo.manager.count(
        CandidatureOrmEntity,
        { where: { demandeId: entity.id, statutCandidatureId: acceptedId } },
      );
      const missionEntity = await this.demandeRepo.manager.findOne(
        MissionOrmEntity,
        {
          where: { demandeId: entity.id },
          relations: ['statutMission'],
        },
      );

      items.push({
        request: RequestOrmMapper.toDomain(entity),
        pendingApplications,
        acceptedApplications,
        mission: missionEntity
          ? MissionOrmMapper.toDomain(missionEntity)
          : null,
      });
    }

    return {
      items,
      total,
      page: options.page,
      pageSize: options.pageSize,
    };
  }

  async listForAdmin(options: {
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PageResult<RequestWithStats>> {
    const qb = this.demandeRepo
      .createQueryBuilder('d')
      .innerJoinAndSelect('d.statutDemande', 's')
      .orderBy('d.dateCreation', 'DESC')
      .skip((options.page - 1) * options.pageSize)
      .take(options.pageSize);

    if (options.status) {
      qb.andWhere('s.code = :status', { status: options.status });
    }

    const [entities, total] = await qb.getManyAndCount();

    const pendingId = await this.statusLookup.getCandidatureStatusId('PENDING');
    const acceptedId =
      await this.statusLookup.getCandidatureStatusId('ACCEPTED');

    const items: RequestWithStats[] = [];
    for (const entity of entities) {
      const pendingApplications = await this.demandeRepo.manager.count(
        CandidatureOrmEntity,
        { where: { demandeId: entity.id, statutCandidatureId: pendingId } },
      );
      const acceptedApplications = await this.demandeRepo.manager.count(
        CandidatureOrmEntity,
        { where: { demandeId: entity.id, statutCandidatureId: acceptedId } },
      );
      const missionEntity = await this.demandeRepo.manager.findOne(
        MissionOrmEntity,
        {
          where: { demandeId: entity.id },
          relations: ['statutMission'],
        },
      );

      items.push({
        request: RequestOrmMapper.toDomain(entity),
        pendingApplications,
        acceptedApplications,
        mission: missionEntity
          ? MissionOrmMapper.toDomain(missionEntity)
          : null,
      });
    }

    return {
      items,
      total,
      page: options.page,
      pageSize: options.pageSize,
    };
  }
}
