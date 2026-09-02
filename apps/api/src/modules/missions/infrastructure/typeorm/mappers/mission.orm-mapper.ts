import { Mission } from '../../../domain/entities/mission.entity';
import { MissionOrmEntity } from '../entities/mission.orm-entity';
import type { MissionStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export class MissionOrmMapper {
  static toDomain(entity: MissionOrmEntity): Mission {
    return new Mission({
      id: entity.id,
      demandeId: entity.demandeId,
      statusCode: entity.statutMission.code as MissionStatusCode,
      montantTotal: Number(entity.montantTotal),
      dateDebut: entity.dateDebut,
      dateFin: entity.dateFin,
      createdAt: entity.dateCreation,
      updatedAt: entity.dateMaj,
    });
  }
}
