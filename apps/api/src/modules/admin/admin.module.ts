import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from '@modules/identity/identity.module';
import { RequestsModule } from '@modules/requests/requests.module';
import { MessagingModule } from '@modules/messaging/messaging.module';
import { UserOrmEntity } from '@modules/identity/infrastructure/typeorm/entities/user.orm-entity';
import { DemandeOrmEntity } from '@modules/requests/infrastructure/typeorm/entities/demande.orm-entity';
import { MissionOrmEntity } from '@modules/missions/infrastructure/typeorm/entities/mission.orm-entity';
import { SignalementOrmEntity } from '@modules/reports/infrastructure/typeorm/entities/signalement.orm-entity';
import {
  Message,
  MessageSchema,
} from '@modules/messaging/infrastructure/mongo/schemas/message.schema';
import { GetAdminStatsUseCase } from './application/use-cases/get-admin-stats.use-case';
import {
  BanAdminUserUseCase,
  CreateAdminUserUseCase,
  GetAdminUserUseCase,
  ListAdminUsersUseCase,
  UnbanAdminUserUseCase,
  UpdateAdminUserUseCase,
} from './application/use-cases/admin-users.use-cases';
import {
  CancelAdminRequestUseCase,
  CreateAdminRequestUseCase,
  GetAdminRequestUseCase,
  ListAdminRequestsUseCase,
  UpdateAdminRequestUseCase,
} from './application/use-cases/admin-requests.use-cases';
import { AdminStatsController } from './presentation/http/controllers/admin-stats.controller';
import { AdminUsersController } from './presentation/http/controllers/admin-users.controller';
import { AdminRequestsController } from './presentation/http/controllers/admin-requests.controller';
import { AdminMissionMessagesController } from './presentation/http/controllers/admin-mission-messages.controller';

@Module({
  imports: [
    IdentityModule,
    RequestsModule,
    MessagingModule,
    TypeOrmModule.forFeature([
      UserOrmEntity,
      DemandeOrmEntity,
      MissionOrmEntity,
      SignalementOrmEntity,
    ]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [
    AdminStatsController,
    AdminUsersController,
    AdminRequestsController,
    AdminMissionMessagesController,
  ],
  providers: [
    GetAdminStatsUseCase,
    ListAdminUsersUseCase,
    GetAdminUserUseCase,
    CreateAdminUserUseCase,
    UpdateAdminUserUseCase,
    BanAdminUserUseCase,
    UnbanAdminUserUseCase,
    ListAdminRequestsUseCase,
    GetAdminRequestUseCase,
    CreateAdminRequestUseCase,
    UpdateAdminRequestUseCase,
    CancelAdminRequestUseCase,
  ],
})
export class AdminModule {}
