import { Request } from '../../../domain/entities/request.entity';
import { DemandeOrmEntity } from '../entities/demande.orm-entity';
import type { DemandeStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export class RequestOrmMapper {
  static toDomain(entity: DemandeOrmEntity): Request {
    return new Request({
      id: entity.id,
      demandeurId: entity.demandeurId,
      statusCode: entity.statutDemande.code as DemandeStatusCode,
      titre: entity.titre,
      description: entity.description,
      contraintesPhysiques: entity.contraintesPhysiques,
      adresse: entity.adresse,
      latitude: entity.latitude !== null ? Number(entity.latitude) : null,
      longitude: entity.longitude !== null ? Number(entity.longitude) : null,
      dateMission: entity.dateMission,
      dureeEstimee: entity.dureeEstimee,
      nbAidantsRequis: entity.nbAidantsRequis,
      budgetEstime:
        entity.budgetEstime !== null ? Number(entity.budgetEstime) : null,
      createdAt: entity.dateCreation,
      updatedAt: entity.dateMaj,
    });
  }

  static toOrm(
    request: Request,
    statutDemandeId: number,
  ): Partial<DemandeOrmEntity> {
    return {
      id: request.id,
      demandeurId: request.demandeurId,
      statutDemandeId,
      titre: request.titre,
      description: request.description,
      contraintesPhysiques: request.contraintesPhysiques,
      adresse: request.adresse,
      latitude:
        request.latitude !== null ? request.latitude.toString() : null,
      longitude:
        request.longitude !== null ? request.longitude.toString() : null,
      dateMission: request.dateMission,
      dureeEstimee: request.dureeEstimee,
      nbAidantsRequis: request.nbAidantsRequis,
      budgetEstime:
        request.budgetEstime !== null ? request.budgetEstime.toString() : null,
      dateCreation: request.createdAt,
      dateMaj: request.updatedAt,
    };
  }
}
