import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportRepository } from '../../domain/repositories/report.repository';
import { Report } from '../../domain/entities/report.entity';
import { MissionRepository } from '@modules/missions/domain/repositories/mission.repository';
import { RequestRepository } from '@modules/requests/domain/repositories/request.repository';
import { REPORT_REPOSITORY } from '../../reports.tokens';
import { MISSION_REPOSITORY } from '@modules/missions/missions.tokens';
import { REQUEST_REPOSITORY } from '@modules/requests/requests.tokens';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import {
  CreateReportCommand,
  CreateReportResult,
} from '../dto/report.commands';

const MOTIF_CODES = new Set([
  'NO_SHOW',
  'DELAY',
  'NOT_PERFORMED',
  'BEHAVIOUR',
  'PAYMENT',
  'OTHER',
]);

@Injectable()
export class CreateReportUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: ReportRepository,
    @Inject(MISSION_REPOSITORY)
    private readonly missionRepository: MissionRepository,
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: RequestRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(command: CreateReportCommand): Promise<CreateReportResult> {
    const description = command.description?.trim() ?? '';
    if (!description) {
      throw new BadRequestException('La description est obligatoire');
    }

    if (!MOTIF_CODES.has(command.motif)) {
      throw new BadRequestException('Motif de signalement invalide');
    }

    const mission = await this.missionRepository.findById(command.missionId);
    if (!mission) {
      throw new NotFoundException('Mission introuvable');
    }

    const request = await this.requestRepository.findById(mission.demandeId);
    if (!request) {
      throw new NotFoundException('Demande introuvable');
    }

    const isDemandeur = request.demandeurId === command.authorId;
    const participation =
      await this.missionRepository.findParticipationByMissionAndAidant(
        command.missionId,
        command.authorId,
      );
    const isAidant = participation !== null;

    if (!isDemandeur && !isAidant) {
      throw new ForbiddenException(
        'Seuls les participants de la mission peuvent signaler',
      );
    }

    const now = this.clock.now();
    const saved = await this.reportRepository.save(
      Report.create({
        missionId: command.missionId,
        auteurId: command.authorId,
        motifCode: command.motif,
        description,
        now,
      }),
    );

    return {
      id: saved.id!,
      missionId: saved.missionId,
      motif: saved.motifCode,
      status: saved.statusCode,
      description: saved.description,
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
