import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MissionRepository } from '../../domain/repositories/mission.repository';
import { RequestRepository } from '@modules/requests/domain/repositories/request.repository';
import { MISSION_REPOSITORY } from '../../missions.tokens';
import { REQUEST_REPOSITORY } from '@modules/requests/requests.tokens';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import {
  AuthorizePaymentCommand,
  AuthorizePaymentResult,
} from '../dto/mission.commands';

@Injectable()
export class AuthorizePaymentUseCase {
  constructor(
    @Inject(MISSION_REPOSITORY)
    private readonly missionRepository: MissionRepository,
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(
    command: AuthorizePaymentCommand,
  ): Promise<AuthorizePaymentResult> {
    const mission = await this.missionRepository.findById(command.missionId);
    if (!mission) {
      throw new NotFoundException('Mission introuvable');
    }

    const request = await this.requestRepository.findById(mission.demandeId);
    if (!request) {
      throw new NotFoundException('Demande introuvable');
    }

    if (request.demandeurId !== command.demandeurId) {
      throw new ForbiddenException('Accès non autorisé à cette mission');
    }

    if (mission.statusCode !== 'AWAITING_PAYMENT') {
      throw new UnprocessableEntityException(
        'Seules les missions en attente de paiement peuvent être autorisées',
      );
    }

    const now = this.clock.now();
    const updated = await this.missionRepository.save(
      mission.withStatus('CONFIRMED', now),
    );

    return {
      missionId: updated.id!,
      status: updated.statusCode,
      montantTotal: updated.montantTotal,
    };
  }
}
