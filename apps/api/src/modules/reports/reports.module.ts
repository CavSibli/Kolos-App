import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '@modules/identity/identity.module';
import { MissionsModule } from '@modules/missions/missions.module';
import { RequestsModule } from '@modules/requests/requests.module';
import { SignalementOrmEntity } from './infrastructure/typeorm/entities/signalement.orm-entity';
import { TypeSignalementOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/type-signalement.orm-entity';
import { StatutSignalementOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/statut-signalement.orm-entity';
import { PrioriteSignalementOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/priorite-signalement.orm-entity';
import { TypeOrmReportRepository } from './infrastructure/typeorm/repositories/typeorm-report.repository';
import { CreateReportUseCase } from './application/use-cases/create-report.use-case';
import { ListAdminReportsUseCase } from './application/use-cases/list-admin-reports.use-case';
import { MissionReportsController } from './presentation/http/controllers/mission-reports.controller';
import { AdminReportsController } from './presentation/http/controllers/admin-reports.controller';
import { REPORT_REPOSITORY } from './reports.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SignalementOrmEntity,
      TypeSignalementOrmEntity,
      StatutSignalementOrmEntity,
      PrioriteSignalementOrmEntity,
    ]),
    IdentityModule,
    MissionsModule,
    RequestsModule,
  ],
  controllers: [MissionReportsController, AdminReportsController],
  providers: [
    {
      provide: REPORT_REPOSITORY,
      useClass: TypeOrmReportRepository,
    },
    {
      provide: TypeOrmReportRepository,
      useExisting: REPORT_REPOSITORY,
    },
    CreateReportUseCase,
    ListAdminReportsUseCase,
  ],
  exports: [REPORT_REPOSITORY],
})
export class ReportsModule {}
