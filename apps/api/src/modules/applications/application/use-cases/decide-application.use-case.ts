import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApplicationRepository } from '../../domain/repositories/application.repository';
import { RequestRepository } from '@modules/requests/domain/repositories/request.repository';
import { MissionRepository } from '@modules/missions/domain/repositories/mission.repository';
import { APPLICATION_REPOSITORY } from '../../applications.tokens';
import { REQUEST_REPOSITORY } from '@modules/requests/requests.tokens';
import { MISSION_REPOSITORY } from '@modules/missions/missions.tokens';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import {
  DecideApplicationCommand,
  DecideApplicationResult,
} from '../dto/application.commands';

@Injectable()
export class DecideApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepository: ApplicationRepository,
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
    @Inject(MISSION_REPOSITORY)
    private readonly missionRepository: MissionRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(command: DecideApplicationCommand): Promise<DecideApplicationResult> {
    const application = await this.applicationRepository.findById(
      command.applicationId,
    );
    if (!application) {
      throw new NotFoundException('Candidature introuvable');
    }

    const request = await this.requestRepository.findById(application.demandeId);
    if (!request) {
      throw new NotFoundException('Demande introuvable');
    }

    if (request.demandeurId !== command.demandeurId) {
      throw new ForbiddenException('Accès non autorisé à cette candidature');
    }

    if (application.statusCode !== 'PENDING') {
      throw new UnprocessableEntityException(
        'Seules les candidatures en attente peuvent être traitées',
      );
    }

    if (
      request.statusCode !== 'PUBLISHED' &&
      request.statusCode !== 'PARTIALLY_ASSIGNED'
    ) {
      throw new UnprocessableEntityException(
        'Cette demande n\'accepte plus de décisions',
      );
    }

    const now = this.clock.now();
    let missionResult: DecideApplicationResult['mission'] = null;

    if (command.decision === 'REFUSED') {
      await this.applicationRepository.save(
        application.withStatus('REFUSED', now),
      );
    } else {
      await this.applicationRepository.save(
        application.withStatus('ACCEPTED', now),
      );

      const acceptedCount = await this.applicationRepository.countAccepted(
        request.id!,
      );

      if (acceptedCount < request.nbAidantsRequis) {
        await this.requestRepository.save(
          request.withStatus('PARTIALLY_ASSIGNED', now),
        );
      } else if (acceptedCount === request.nbAidantsRequis) {
        await this.applicationRepository.refuseRemainingPending(request.id!, now);

        const acceptedApplications =
          await this.applicationRepository.findAcceptedByDemandeId(request.id!);

        const { mission } = await this.missionRepository.createWithParticipants({
          demandeId: request.id!,
          acceptedApplications,
          now,
        });

        await this.requestRepository.save(request.withStatus('ASSIGNED', now));

        missionResult = {
          id: mission.id!,
          status: mission.statusCode,
          montantTotal: mission.montantTotal,
        };
      }
    }

    const updatedApplication = await this.applicationRepository.findById(
      command.applicationId,
    );
    const updatedRequest = await this.requestRepository.findById(request.id!);

    return {
      applicationId: command.applicationId,
      status: updatedApplication!.statusCode,
      requestStatus: updatedRequest!.statusCode,
      mission: missionResult,
    };
  }
}
