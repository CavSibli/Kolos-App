import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import { CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY } from '../../messaging.tokens';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';
import { MissionMessagingAccessService } from '../services/mission-messaging-access.service';
import {
  MessageResult,
  PostMessageCommand,
} from '../dto/messaging.commands';

@Injectable()
export class PostMessageUseCase {
  constructor(
    private readonly access: MissionMessagingAccessService,
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(command: PostMessageCommand): Promise<MessageResult> {
    const body = command.body?.trim() ?? '';
    if (!body) {
      throw new BadRequestException('Le message ne peut pas être vide');
    }

    await this.access.assertParticipant(command.missionId, command.userId);

    const participantIds = await this.access.resolveParticipantIds(
      command.missionId,
    );
    const conversation = await this.conversationRepository.getOrCreate(
      command.missionId,
      participantIds,
    );

    const saved = await this.messageRepository.insert({
      conversationId: conversation.id,
      missionId: command.missionId,
      userId: command.userId,
      body,
      createdAt: this.clock.now(),
    });

    return {
      id: saved.id,
      conversationId: saved.conversationId,
      missionId: saved.missionId,
      userId: saved.userId,
      body: saved.body,
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
