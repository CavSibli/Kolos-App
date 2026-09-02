import { Application } from '../../../domain/entities/application.entity';
import { CandidatureOrmEntity } from '../entities/candidature.orm-entity';
import type { CandidatureStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export class ApplicationOrmMapper {
  static toDomain(entity: CandidatureOrmEntity): Application {
    return new Application({
      id: entity.id,
      demandeId: entity.demandeId,
      aidantId: entity.aidantId,
      statusCode: entity.statutCandidature.code as CandidatureStatusCode,
      message: entity.message,
      prixPropose:
        entity.prixPropose !== null ? Number(entity.prixPropose) : null,
      createdAt: entity.dateCreation,
      updatedAt: entity.dateMaj,
    });
  }

  static toOrm(
    application: Application,
    statutCandidatureId: number,
  ): Partial<CandidatureOrmEntity> {
    return {
      id: application.id,
      demandeId: application.demandeId,
      aidantId: application.aidantId,
      statutCandidatureId,
      message: application.message,
      prixPropose:
        application.prixPropose !== null
          ? application.prixPropose.toString()
          : null,
      dateCreation: application.createdAt,
      dateMaj: application.updatedAt,
    };
  }
}
