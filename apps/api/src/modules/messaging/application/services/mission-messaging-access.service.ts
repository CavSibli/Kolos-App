import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MissionRepository } from '@modules/missions/domain/repositories/mission.repository';
import { RequestRepository } from '@modules/requests/domain/repositories/request.repository';
import { MISSION_REPOSITORY } from '@modules/missions/missions.tokens';
import { REQUEST_REPOSITORY } from '@modules/requests/requests.tokens';
import type { Mission } from '@modules/missions/domain/entities/mission.entity';
import type { Request } from '@modules/requests/domain/entities/request.entity';

@Injectable()
export class MissionMessagingAccessService {
  constructor(
    @Inject(MISSION_REPOSITORY)
    private readonly missionRepository: MissionRepository,
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
  ) {}

  async assertParticipant(
    missionId: number,
    userId: string,
    options?: { asAdmin?: boolean },
  ): Promise<{ mission: Mission; request: Request }> {
    const mission = await this.missionRepository.findById(missionId);
    if (!mission) {
      throw new NotFoundException('Mission introuvable');
    }

    if (mission.statusCode !== 'CONFIRMED') {
      throw new UnprocessableEntityException(
        'La messagerie est disponible après confirmation du paiement',
      );
    }

    const request = await this.requestRepository.findById(mission.demandeId);
    if (!request) {
      throw new NotFoundException('Demande introuvable');
    }

    if (options?.asAdmin) {
      return { mission, request };
    }

    const isDemandeur = request.demandeurId === userId;
    const participation =
      await this.missionRepository.findParticipationByMissionAndAidant(
        missionId,
        userId,
      );
    const isAidant = participation !== null;

    if (!isDemandeur && !isAidant) {
      throw new ForbiddenException(
        'Seuls les participants de la mission peuvent accéder à la messagerie',
      );
    }

    return { mission, request };
  }

  async resolveParticipantIds(missionId: number): Promise<string[]> {
    const mission = await this.missionRepository.findById(missionId);
    if (!mission) {
      throw new NotFoundException('Mission introuvable');
    }

    const request = await this.requestRepository.findById(mission.demandeId);
    if (!request) {
      throw new NotFoundException('Demande introuvable');
    }

    const participations =
      await this.missionRepository.findParticipationsByMissionId(missionId);

    return [
      request.demandeurId,
      ...participations.map((participation) => participation.aidantId),
    ];
  }
}
