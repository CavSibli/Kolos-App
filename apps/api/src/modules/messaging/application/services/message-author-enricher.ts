import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@modules/identity/identity.tokens';
import type { UserRepository } from '@modules/identity/domain/repositories/user.repository';
import { UserId } from '@modules/identity/domain/value-objects/user-id.vo';
import type { MessageResult } from '../dto/messaging.commands';

@Injectable()
export class MessageAuthorEnricher {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async enrichOne(message: {
    id: string;
    conversationId: string;
    missionId: number;
    userId: string;
    body: string;
    createdAt: Date | string;
  }): Promise<MessageResult> {
    const [enriched] = await this.enrichMany([message]);
    return enriched;
  }

  async enrichMany(
    messages: Array<{
      id: string;
      conversationId: string;
      missionId: number;
      userId: string;
      body: string;
      createdAt: Date | string;
    }>,
  ): Promise<MessageResult[]> {
    if (messages.length === 0) {
      return [];
    }

    const userIds = [
      ...new Set(messages.map((message) => message.userId)),
    ].map((id) => UserId.create(id));

    const users = await this.userRepository.findByIds(userIds);
    const byId = new Map(
      users.map((user) => [user.id.toString(), user] as const),
    );

    return messages.map((message) => {
      const author = byId.get(message.userId);
      const createdAt =
        typeof message.createdAt === 'string'
          ? message.createdAt
          : message.createdAt.toISOString();

      return {
        id: message.id,
        conversationId: message.conversationId,
        missionId: message.missionId,
        userId: message.userId,
        authorFirstName: author?.firstName ?? null,
        authorLastName: author?.lastName ?? null,
        authorDisplayName: author
          ? `${author.firstName} ${author.lastName}`.trim()
          : 'Participant',
        body: message.body,
        createdAt,
      };
    });
  }
}
