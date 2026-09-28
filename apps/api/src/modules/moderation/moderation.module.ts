import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from '@modules/identity/identity.module';
import {
  ModerationAction,
  ModerationActionSchema,
} from './infrastructure/mongo/schemas/moderation-action.schema';
import { MongooseModerationActionRepository } from './infrastructure/mongo/repositories/mongoose-moderation-action.repository';
import { CreateModerationActionUseCase } from './application/use-cases/create-moderation-action.use-case';
import { ListModerationActionsUseCase } from './application/use-cases/list-moderation-actions.use-case';
import { MODERATION_ACTION_REPOSITORY } from './moderation.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModerationAction.name, schema: ModerationActionSchema },
    ]),
    IdentityModule,
  ],
  providers: [
    {
      provide: MODERATION_ACTION_REPOSITORY,
      useClass: MongooseModerationActionRepository,
    },
    CreateModerationActionUseCase,
    ListModerationActionsUseCase,
  ],
  exports: [
    CreateModerationActionUseCase,
    ListModerationActionsUseCase,
    MODERATION_ACTION_REPOSITORY,
  ],
})
export class ModerationModule {}
