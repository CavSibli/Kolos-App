import { Inject, Injectable } from '@nestjs/common';
import { CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY } from '../../messaging.tokens';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';
import { MissionMessagingAccessService } from '../services/mission-messaging-access.service';
import {
  ListMessagesCommand,
  MessageResult,
} from '../dto/messaging.commands';

@Injectable()
export class ListMessagesUseCase {
  constructor(
    private readonly access: MissionMessagingAccessService,
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(command: ListMessagesCommand): Promise<MessageResult[]> {
    await this.access.assertParticipant(command.missionId, command.userId);

    const conversation = await this.conversationRepository.findByMissionId(
      command.missionId,
    );
    if (!conversation) {
      return [];
    }

    const messages = await this.messageRepository.listByConversationId(
      conversation.id,
    );

    return messages.map((message) => ({
      id: message.id,
      conversationId: message.conversationId,
      missionId: message.missionId,
      userId: message.userId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    }));
  }
}
