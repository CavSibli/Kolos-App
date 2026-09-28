import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from '@modules/identity/identity.module';
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
import { AdminStatsController } from './presentation/http/controllers/admin-stats.controller';
import { AdminUsersController } from './presentation/http/controllers/admin-users.controller';

@Module({
  imports: [
    IdentityModule,
    TypeOrmModule.forFeature([
      UserOrmEntity,
      DemandeOrmEntity,
      MissionOrmEntity,
      SignalementOrmEntity,
    ]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [AdminStatsController, AdminUsersController],
  providers: [
    GetAdminStatsUseCase,
    ListAdminUsersUseCase,
    GetAdminUserUseCase,
    CreateAdminUserUseCase,
    UpdateAdminUserUseCase,
    BanAdminUserUseCase,
    UnbanAdminUserUseCase,
  ],
})
export class AdminModule {}
