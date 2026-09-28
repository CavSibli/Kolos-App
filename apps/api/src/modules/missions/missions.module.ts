import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '@modules/identity/identity.module';
import { RequestsModule } from '@modules/requests/requests.module';
import { MissionOrmEntity } from './infrastructure/typeorm/entities/mission.orm-entity';
import { ParticipationOrmEntity } from './infrastructure/typeorm/entities/participation.orm-entity';
import { TypeOrmMissionRepository } from './infrastructure/typeorm/repositories/typeorm-mission.repository';
import { AuthorizePaymentUseCase } from './application/use-cases/authorize-payment.use-case';
import { MissionsController } from './presentation/http/controllers/missions.controller';
import { MISSION_REPOSITORY } from './missions.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([MissionOrmEntity, ParticipationOrmEntity]),
    IdentityModule,
    RequestsModule,
  ],
  controllers: [MissionsController],
  providers: [
    {
      provide: MISSION_REPOSITORY,
      useClass: TypeOrmMissionRepository,
    },
    {
      provide: TypeOrmMissionRepository,
      useExisting: MISSION_REPOSITORY,
    },
    AuthorizePaymentUseCase,
  ],
  exports: [MISSION_REPOSITORY],
})
export class MissionsModule {}
