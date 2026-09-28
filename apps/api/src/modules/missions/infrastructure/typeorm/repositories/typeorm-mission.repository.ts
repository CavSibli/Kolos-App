import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  CreateMissionWithParticipantsInput,
  CreateMissionWithParticipantsResult,
  MissionRepository,
} from '../../../domain/repositories/mission.repository';
import { Mission } from '../../../domain/entities/mission.entity';
import { Participation } from '../../../domain/entities/participation.entity';
import { MissionOrmEntity } from '../entities/mission.orm-entity';
import { ParticipationOrmEntity } from '../entities/participation.orm-entity';
import { MissionOrmMapper } from '../mappers/mission.orm-mapper';
import { ParticipationOrmMapper } from '../mappers/participation.orm-mapper';
import { STATUS_LOOKUP } from '@shared/reference-data/reference-data.tokens';
import type { StatusLookupPort } from '@shared/reference-data/application/ports/status-lookup.port';

@Injectable()
export class TypeOrmMissionRepository implements MissionRepository {
  constructor(
    @InjectRepository(MissionOrmEntity)
    private readonly missionRepo: Repository<MissionOrmEntity>,
    @InjectRepository(ParticipationOrmEntity)
    private readonly participationRepo: Repository<ParticipationOrmEntity>,
    @Inject(STATUS_LOOKUP)
    private readonly statusLookup: StatusLookupPort,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: number): Promise<Mission | null> {
    const entity = await this.missionRepo.findOne({
      where: { id },
      relations: ['statutMission'],
    });
    return entity ? MissionOrmMapper.toDomain(entity) : null;
  }

  async findByDemandeId(demandeId: number): Promise<Mission | null> {
    const entity = await this.missionRepo.findOne({
      where: { demandeId },
      relations: ['statutMission'],
    });
    return entity ? MissionOrmMapper.toDomain(entity) : null;
  }

  async findParticipationByMissionAndAidant(
    missionId: number,
    aidantId: string,
  ): Promise<Participation | null> {
    const entity = await this.participationRepo.findOne({
      where: { missionId, aidantId },
      relations: ['statutParticipation'],
    });
    return entity ? ParticipationOrmMapper.toDomain(entity) : null;
  }

  async findParticipationsByMissionId(
    missionId: number,
  ): Promise<Participation[]> {
    const entities = await this.participationRepo.find({
      where: { missionId },
      relations: ['statutParticipation'],
    });
    return entities.map((entity) => ParticipationOrmMapper.toDomain(entity));
  }

  async save(mission: Mission): Promise<Mission> {
    if (mission.id === undefined) {
      throw new Error('Cannot save mission without id');
    }

    const statutMissionId = await this.statusLookup.getMissionStatusId(
      mission.statusCode,
    );

    await this.missionRepo.update(mission.id, {
      statutMissionId,
      dateMaj: mission.updatedAt,
    });

    const reloaded = await this.missionRepo.findOneOrFail({
      where: { id: mission.id },
      relations: ['statutMission'],
    });

    return MissionOrmMapper.toDomain(reloaded);
  }

  async createWithParticipants(
    input: CreateMissionWithParticipantsInput,
  ): Promise<CreateMissionWithParticipantsResult> {
    const awaitingPaymentId =
      await this.statusLookup.getMissionStatusId('AWAITING_PAYMENT');
    const selectedId =
      await this.statusLookup.getParticipationStatusId('SELECTED');

    const montantTotal = input.acceptedApplications.reduce(
      (sum, application) => sum + (application.prixPropose ?? 0),
      0,
    );

    return this.dataSource.transaction(async (manager) => {
      const missionEntity = manager.create(MissionOrmEntity, {
        demandeId: input.demandeId,
        statutMissionId: awaitingPaymentId,
        montantTotal: montantTotal.toString(),
        dateCreation: input.now,
        dateMaj: input.now,
      });
      const savedMission = await manager.save(missionEntity);

      const participations: Participation[] = [];
      for (const application of input.acceptedApplications) {
        const participationEntity = manager.create(ParticipationOrmEntity, {
          missionId: savedMission.id,
          aidantId: application.aidantId,
          candidatureId: application.id!,
          statutParticipationId: selectedId,
          montantConvenu: (application.prixPropose ?? 0).toString(),
          dateAcceptation: input.now,
          dateCreation: input.now,
          dateMaj: input.now,
        });
        const savedParticipation = await manager.save(participationEntity);
        const reloaded = await manager.findOneOrFail(ParticipationOrmEntity, {
          where: { id: savedParticipation.id },
          relations: ['statutParticipation'],
        });
        participations.push(ParticipationOrmMapper.toDomain(reloaded));
      }

      const reloadedMission = await manager.findOneOrFail(MissionOrmEntity, {
        where: { id: savedMission.id },
        relations: ['statutMission'],
      });

      return {
        mission: MissionOrmMapper.toDomain(reloadedMission),
        participations,
      };
    });
  }
}
