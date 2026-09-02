import { Request } from '../../domain/entities/request.entity';
import { RequestResult } from '../dto/request.commands';

export function toRequestResult(request: Request): RequestResult {
  return {
    id: request.id!,
    demandeurId: request.demandeurId,
    status: request.statusCode,
    titre: request.titre,
    description: request.description,
    contraintesPhysiques: request.contraintesPhysiques,
    adresse: request.adresse,
    latitude: request.latitude,
    longitude: request.longitude,
    dateMission: request.dateMission.toISOString(),
    dureeEstimee: request.dureeEstimee,
    nbAidantsRequis: request.nbAidantsRequis,
    budgetEstime: request.budgetEstime,
    createdAt: request.createdAt.toISOString(),
  };
}
