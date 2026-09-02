import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionOrmEntity } from './infrastructure/typeorm/entities/mission.orm-entity';
import { ParticipationOrmEntity } from './infrastructure/typeorm/entities/participation.orm-entity';
import { TypeOrmMissionRepository } from './infrastructure/typeorm/repositories/typeorm-mission.repository';
import { MISSION_REPOSITORY } from './missions.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([MissionOrmEntity, ParticipationOrmEntity])],
  providers: [
    {
      provide: MISSION_REPOSITORY,
      useClass: TypeOrmMissionRepository,
    },
    {
      provide: TypeOrmMissionRepository,
      useExisting: MISSION_REPOSITORY,
    },
  ],
  exports: [MISSION_REPOSITORY],
})
export class MissionsModule {}
