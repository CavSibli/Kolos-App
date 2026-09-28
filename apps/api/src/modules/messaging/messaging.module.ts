import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from '@modules/identity/identity.module';
import { MissionsModule } from '@modules/missions/missions.module';
import { RequestsModule } from '@modules/requests/requests.module';
import {
  Conversation,
  ConversationSchema,
} from './infrastructure/mongo/schemas/conversation.schema';
import {
  Message,
  MessageSchema,
} from './infrastructure/mongo/schemas/message.schema';
import { MongooseConversationRepository } from './infrastructure/mongo/repositories/mongoose-conversation.repository';
import { MongooseMessageRepository } from './infrastructure/mongo/repositories/mongoose-message.repository';
import { MissionMessagingAccessService } from './application/services/mission-messaging-access.service';
import { ListMessagesUseCase } from './application/use-cases/list-messages.use-case';
import { PostMessageUseCase } from './application/use-cases/post-message.use-case';
import { MissionMessagesController } from './presentation/http/controllers/mission-messages.controller';
import {
  CONVERSATION_REPOSITORY,
  MESSAGE_REPOSITORY,
} from './messaging.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    IdentityModule,
    MissionsModule,
    RequestsModule,
  ],
  controllers: [MissionMessagesController],
  providers: [
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: MongooseConversationRepository,
    },
    {
      provide: MESSAGE_REPOSITORY,
      useClass: MongooseMessageRepository,
    },
    MissionMessagingAccessService,
    ListMessagesUseCase,
    PostMessageUseCase,
  ],
})
export class MessagingModule {}
