import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateModerationActionUseCase } from '@modules/moderation/application/use-cases/create-moderation-action.use-case';
import {
  MODERATION_ACTION_CODES,
  ModerationActionCode,
} from '@modules/moderation/application/dto/moderation.commands';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import { ReportRepository } from '../../domain/repositories/report.repository';
import type { ReportStatusCode } from '../../domain/entities/report.entity';
import { REPORT_REPOSITORY } from '../../reports.tokens';
import {
  ModerateReportCommand,
  ModerateReportResult,
} from '../dto/report.commands';

const ACTION_TO_STATUS: Record<ModerationActionCode, ReportStatusCode> = {
  CLASSIFY: 'RESOLVED',
  DISMISS: 'REJECTED',
  MASK: 'IN_REVIEW',
};

@Injectable()
export class ModerateReportUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: ReportRepository,
    private readonly createModerationActionUseCase: CreateModerationActionUseCase,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(command: ModerateReportCommand): Promise<ModerateReportResult> {
    const action = command.action?.trim().toUpperCase() ?? '';
    if (!MODERATION_ACTION_CODES.includes(action as ModerationActionCode)) {
      throw new BadRequestException(
        `action invalide (attendu: ${MODERATION_ACTION_CODES.join(', ')})`,
      );
    }

    const report = await this.reportRepository.findById(command.reportId);
    if (!report) {
      throw new NotFoundException('Signalement introuvable');
    }

    const nextStatus = ACTION_TO_STATUS[action as ModerationActionCode];
    const previousStatus = report.statusCode;
    const now = this.clock.now();

    const moderation = await this.createModerationActionUseCase.execute({
      reportId: command.reportId,
      adminId: command.adminId,
      action,
      reason: command.reason,
      payload: {
        previousStatus,
        nextStatus,
        source: 'admin',
      },
    });

    const updated = await this.reportRepository.updateStatus(
      command.reportId,
      nextStatus,
      now,
    );

    return {
      ...moderation,
      reportStatus: updated.statusCode,
    };
  }
}
