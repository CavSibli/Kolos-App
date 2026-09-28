import { Report } from '../../../domain/entities/report.entity';
import { SignalementOrmEntity } from '../entities/signalement.orm-entity';
import type {
  ReportMotifCode,
  ReportPriorityCode,
  ReportStatusCode,
} from '../../../domain/entities/report.entity';

export class ReportOrmMapper {
  static toDomain(entity: SignalementOrmEntity): Report {
    return new Report({
      id: entity.id,
      missionId: entity.missionId,
      auteurId: entity.auteurId,
      utilisateurSignaleId: entity.utilisateurSignaleId,
      motifCode: entity.typeSignalement.code as ReportMotifCode,
      statusCode: entity.statutSignalement.code as ReportStatusCode,
      priorityCode: entity.prioriteSignalement.code as ReportPriorityCode,
      description: entity.description,
      createdAt: entity.dateCreation,
      updatedAt: entity.dateMaj,
    });
  }
}
