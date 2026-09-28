import { Inject, Injectable } from '@nestjs/common';
import { MODERATION_ACTION_REPOSITORY } from '../../moderation.tokens';
import type { ModerationActionRepository } from '../../domain/repositories/moderation-action.repository';
import {
  ListModerationActionsCommand,
  ModerationActionResult,
} from '../dto/moderation.commands';

@Injectable()
export class ListModerationActionsUseCase {
  constructor(
    @Inject(MODERATION_ACTION_REPOSITORY)
    private readonly moderationActionRepository: ModerationActionRepository,
  ) {}

  async execute(
    command: ListModerationActionsCommand = {},
  ): Promise<ModerationActionResult[]> {
    const records =
      command.reportId != null
        ? await this.moderationActionRepository.listByReportId(command.reportId)
        : await this.moderationActionRepository.listRecent(command.limit ?? 50);

    return records.map((saved) => ({
      id: saved.id,
      reportId: saved.reportId,
      adminId: saved.adminId,
      action: saved.action,
      reason: saved.reason,
      payload: saved.payload,
      createdAt: saved.createdAt.toISOString(),
    }));
  }
}
