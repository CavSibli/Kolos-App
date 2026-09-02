import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Application } from '../../domain/entities/application.entity';
import { ApplicationRepository } from '../../domain/repositories/application.repository';
import { RequestRepository } from '@modules/requests/domain/repositories/request.repository';
import { REQUEST_REPOSITORY } from '@modules/requests/requests.tokens';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import { APPLICATION_REPOSITORY } from '../../applications.tokens';
import {
  ApplicationResult,
  ApplyToRequestCommand,
} from '../dto/apply-to-request.command';

@Injectable()
export class ApplyToRequestUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepository: ApplicationRepository,
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(command: ApplyToRequestCommand): Promise<ApplicationResult> {
    const request = await this.requestRepository.findById(command.demandeId);
    if (!request) {
      throw new NotFoundException('Demande introuvable');
    }

    const alreadyApplied =
      await this.applicationRepository.existsByDemandeAndAidant(
        command.demandeId,
        command.aidantId,
      );

    if (alreadyApplied) {
      throw new ConflictException('Candidature déjà enregistrée pour cette demande');
    }

    const application = Application.create({
      request,
      aidantId: command.aidantId,
      message: command.message?.trim() || null,
      prixPropose: command.prixPropose ?? null,
      now: this.clock.now(),
    });

    const saved = await this.applicationRepository.save(application);
    return this.toResult(saved);
  }

  private toResult(application: Application): ApplicationResult {
    return {
      id: application.id!,
      demandeId: application.demandeId,
      aidantId: application.aidantId,
      status: application.statusCode,
      message: application.message,
      prixPropose: application.prixPropose,
      createdAt: application.createdAt.toISOString(),
    };
  }
}
