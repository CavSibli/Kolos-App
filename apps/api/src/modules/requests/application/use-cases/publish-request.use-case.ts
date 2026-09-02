import { Inject, Injectable } from '@nestjs/common';
import { Request } from '../../domain/entities/request.entity';
import { RequestRepository } from '../../domain/repositories/request.repository';
import { REQUEST_REPOSITORY } from '../../requests.tokens';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import {
  PublishRequestCommand,
  RequestResult,
} from '../dto/request.commands';

@Injectable()
export class PublishRequestUseCase {
  constructor(
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(command: PublishRequestCommand): Promise<RequestResult> {
    const now = this.clock.now();
    const request = Request.publish({
      demandeurId: command.demandeurId,
      titre: command.titre,
      description: command.description,
      contraintesPhysiques: command.contraintesPhysiques?.trim() || null,
      adresse: command.adresse,
      latitude: command.latitude ?? null,
      longitude: command.longitude ?? null,
      dateMission: new Date(command.dateMission),
      dureeEstimee: command.dureeEstimee,
      nbAidantsRequis: command.nbAidantsRequis,
      budgetEstime: command.budgetEstime ?? null,
      now,
    });

    const saved = await this.requestRepository.save(request);
    return this.toResult(saved);
  }

  private toResult(request: Request): RequestResult {
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
}
