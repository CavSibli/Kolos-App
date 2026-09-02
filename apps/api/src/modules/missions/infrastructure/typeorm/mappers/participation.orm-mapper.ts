import { Participation } from '../../../domain/entities/participation.entity';
import { ParticipationOrmEntity } from '../entities/participation.orm-entity';
import type { ParticipationStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export class ParticipationOrmMapper {
  static toDomain(entity: ParticipationOrmEntity): Participation {
    return new Participation({
      id: entity.id,
      missionId: entity.missionId,
      aidantId: entity.aidantId,
      candidatureId: entity.candidatureId,
      statusCode: entity.statutParticipation.code as ParticipationStatusCode,
      montantConvenu: Number(entity.montantConvenu),
      createdAt: entity.dateCreation,
      updatedAt: entity.dateMaj,
    });
  }
}
