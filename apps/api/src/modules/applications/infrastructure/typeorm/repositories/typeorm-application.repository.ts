import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ApplicationRepository,
  ApplicationWithContext,
  CandidateView,
} from '../../../domain/repositories/application.repository';
import { Application } from '../../../domain/entities/application.entity';
import { CandidatureOrmEntity } from '../entities/candidature.orm-entity';
import { ApplicationOrmMapper } from '../mappers/application.orm-mapper';
import { STATUS_LOOKUP } from '@shared/reference-data/reference-data.tokens';
import type { StatusLookupPort } from '@shared/reference-data/application/ports/status-lookup.port';
import type { PageResult } from '@shared/kernel/application/page-result';
import { DemandeOrmEntity } from '@modules/requests/infrastructure/typeorm/entities/demande.orm-entity';
import { RequestOrmMapper } from '@modules/requests/infrastructure/typeorm/mappers/request.orm-mapper';
import { MissionOrmEntity } from '@modules/missions/infrastructure/typeorm/entities/mission.orm-entity';
import { ParticipationOrmEntity } from '@modules/missions/infrastructure/typeorm/entities/participation.orm-entity';
import { MissionOrmMapper } from '@modules/missions/infrastructure/typeorm/mappers/mission.orm-mapper';
import { ParticipationOrmMapper } from '@modules/missions/infrastructure/typeorm/mappers/participation.orm-mapper';
import { UserOrmEntity } from '@modules/identity/infrastructure/typeorm/entities/user.orm-entity';
import { ProfilAidantOrmEntity } from '@modules/aidant-profile/infrastructure/typeorm/entities/profil-aidant.orm-entity';
import type { CandidatureStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

@Injectable()
export class TypeOrmApplicationRepository implements ApplicationRepository {
  constructor(
    @InjectRepository(CandidatureOrmEntity)
    private readonly candidatureRepo: Repository<CandidatureOrmEntity>,
    @Inject(STATUS_LOOKUP)
    private readonly statusLookup: StatusLookupPort,
  ) {}

  async existsByDemandeAndAidant(
    demandeId: number,
    aidantId: string,
  ): Promise<boolean> {
    const count = await this.candidatureRepo.count({
      where: { demandeId, aidantId },
    });
    return count > 0;
  }

  async findById(id: number): Promise<Application | null> {
    const entity = await this.candidatureRepo.findOne({
      where: { id },
      relations: ['statutCandidature'],
    });
    return entity ? ApplicationOrmMapper.toDomain(entity) : null;
  }

  async save(application: Application): Promise<Application> {
    const statutId = await this.statusLookup.getCandidatureStatusId(
      application.statusCode,
    );
    const partial = ApplicationOrmMapper.toOrm(application, statutId);
    const entity = partial.id
      ? await this.candidatureRepo.findOne({
          where: { id: partial.id },
          relations: ['statutCandidature'],
        })
      : null;

    let savedId: number;
    if (!entity) {
      const created = this.candidatureRepo.create(partial);
      const saved = await this.candidatureRepo.save(created);
      savedId = saved.id;
    } else {
      await this.candidatureRepo.update(entity.id, {
        statutCandidatureId: partial.statutCandidatureId,
        message: partial.message,
        prixPropose: partial.prixPropose,
        dateMaj: partial.dateMaj,
      });
      savedId = entity.id;
    }

    const reloaded = await this.candidatureRepo.findOneOrFail({
      where: { id: savedId },
      relations: ['statutCandidature'],
    });

    return ApplicationOrmMapper.toDomain(reloaded);
  }

  async findByAidantId(options: {
    aidantId: string;
    page: number;
    pageSize: number;
  }): Promise<PageResult<ApplicationWithContext>> {
    const [entities, total] = await this.candidatureRepo.findAndCount({
      where: { aidantId: options.aidantId },
      relations: ['statutCandidature'],
      order: { dateCreation: 'DESC' },
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
    });

    const items = await Promise.all(
      entities.map((entity) =>
        this.buildContext(ApplicationOrmMapper.toDomain(entity)),
      ),
    );

    return {
      items,
      total,
      page: options.page,
      pageSize: options.pageSize,
    };
  }

  async findByIdForAidant(
    id: number,
    aidantId: string,
  ): Promise<ApplicationWithContext | null> {
    const entity = await this.candidatureRepo.findOne({
      where: { id, aidantId },
      relations: ['statutCandidature'],
    });
    if (!entity) {
      return null;
    }
    return this.buildContext(ApplicationOrmMapper.toDomain(entity));
  }

  async findByDemandeId(demandeId: number): Promise<CandidateView[]> {
    const entities = await this.candidatureRepo.find({
      where: { demandeId },
      relations: ['statutCandidature'],
      order: { dateCreation: 'ASC' },
    });

    const results: CandidateView[] = [];
    for (const entity of entities) {
      const user = await this.candidatureRepo.manager.findOne(UserOrmEntity, {
        where: { id: entity.aidantId },
      });
      const profile = await this.candidatureRepo.manager.findOne(
        ProfilAidantOrmEntity,
        { where: { userId: entity.aidantId } },
      );

      results.push({
        application: ApplicationOrmMapper.toDomain(entity),
        aidant: {
          userId: entity.aidantId,
          firstName: user?.firstName ?? '',
          lastName: user?.lastName ?? '',
          bio: profile?.bio ?? null,
          rayonIntervention: profile?.rayonIntervention ?? null,
        },
      });
    }

    return results;
  }

  async countAccepted(demandeId: number): Promise<number> {
    const acceptedId = await this.statusLookup.getCandidatureStatusId('ACCEPTED');
    return this.candidatureRepo.count({
      where: { demandeId, statutCandidatureId: acceptedId },
    });
  }

  async findAcceptedByDemandeId(demandeId: number): Promise<Application[]> {
    const acceptedId = await this.statusLookup.getCandidatureStatusId('ACCEPTED');
    const entities = await this.candidatureRepo.find({
      where: { demandeId, statutCandidatureId: acceptedId },
      relations: ['statutCandidature'],
    });
    return entities.map((entity) => ApplicationOrmMapper.toDomain(entity));
  }

  async refuseRemainingPending(demandeId: number, now: Date): Promise<void> {
    const pendingId = await this.statusLookup.getCandidatureStatusId('PENDING');
    const refusedId = await this.statusLookup.getCandidatureStatusId('REFUSED');

    await this.candidatureRepo.update(
      { demandeId, statutCandidatureId: pendingId },
      { statutCandidatureId: refusedId, dateMaj: now },
    );
  }

  async findStatusMapForAidant(
    demandeIds: number[],
    aidantId: string,
  ): Promise<Map<number, CandidatureStatusCode>> {
    if (demandeIds.length === 0) {
      return new Map();
    }

    const entities = await this.candidatureRepo.find({
      where: { demandeId: In(demandeIds), aidantId },
      relations: ['statutCandidature'],
    });

    const map = new Map<number, CandidatureStatusCode>();
    for (const entity of entities) {
      map.set(
        entity.demandeId,
        entity.statutCandidature.code as CandidatureStatusCode,
      );
    }
    return map;
  }

  private async buildContext(
    application: Application,
  ): Promise<ApplicationWithContext> {
    const demande = await this.candidatureRepo.manager.findOneOrFail(
      DemandeOrmEntity,
      {
        where: { id: application.demandeId },
        relations: ['statutDemande'],
      },
    );

    const missionEntity = await this.candidatureRepo.manager.findOne(
      MissionOrmEntity,
      {
        where: { demandeId: application.demandeId },
        relations: ['statutMission'],
      },
    );

    let participation = null;
    if (missionEntity) {
      const participationEntity = await this.candidatureRepo.manager.findOne(
        ParticipationOrmEntity,
        {
          where: {
            missionId: missionEntity.id,
            aidantId: application.aidantId,
          },
          relations: ['statutParticipation'],
        },
      );
      participation = participationEntity
        ? ParticipationOrmMapper.toDomain(participationEntity)
        : null;
    }

    return {
      application,
      request: RequestOrmMapper.toDomain(demande),
      mission: missionEntity ? MissionOrmMapper.toDomain(missionEntity) : null,
      participation,
    };
  }
}
