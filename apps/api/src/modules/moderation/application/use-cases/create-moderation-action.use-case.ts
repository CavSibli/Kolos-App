import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import { MODERATION_ACTION_REPOSITORY } from '../../moderation.tokens';
import type { ModerationActionRepository } from '../../domain/repositories/moderation-action.repository';
import {
  CreateModerationActionCommand,
  MODERATION_ACTION_CODES,
  ModerationActionCode,
  ModerationActionResult,
} from '../dto/moderation.commands';

@Injectable()
export class CreateModerationActionUseCase {
  constructor(
    @Inject(MODERATION_ACTION_REPOSITORY)
    private readonly moderationActionRepository: ModerationActionRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(
    command: CreateModerationActionCommand,
  ): Promise<ModerationActionResult> {
    if (!Number.isInteger(command.reportId) || command.reportId < 1) {
      throw new BadRequestException('reportId invalide');
    }

    const adminId = command.adminId?.trim() ?? '';
    if (!adminId) {
      throw new BadRequestException('adminId requis');
    }

    const action = command.action?.trim().toUpperCase() ?? '';
    if (!MODERATION_ACTION_CODES.includes(action as ModerationActionCode)) {
      throw new BadRequestException(
        `action invalide (attendu: ${MODERATION_ACTION_CODES.join(', ')})`,
      );
    }

    const reason = command.reason?.trim() || null;
    const payload = command.payload ?? null;

    const saved = await this.moderationActionRepository.insert({
      reportId: command.reportId,
      adminId,
      action,
      reason,
      payload,
      createdAt: this.clock.now(),
    });

    return {
      id: saved.id,
      reportId: saved.reportId,
      adminId: saved.adminId,
      action: saved.action,
      reason: saved.reason,
      payload: saved.payload,
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
