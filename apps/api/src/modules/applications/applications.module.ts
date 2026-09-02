import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '@modules/identity/identity.module';
import { RequestsModule } from '@modules/requests/requests.module';
import { MissionsModule } from '@modules/missions/missions.module';
import { CandidatureOrmEntity } from './infrastructure/typeorm/entities/candidature.orm-entity';
import { TypeOrmApplicationRepository } from './infrastructure/typeorm/repositories/typeorm-application.repository';
import { ApplyToRequestUseCase } from './application/use-cases/apply-to-request.use-case';
import { ListMyApplicationsUseCase } from './application/use-cases/list-my-applications.use-case';
import { GetMyApplicationUseCase } from './application/use-cases/get-my-application.use-case';
import { ListRequestApplicationsUseCase } from './application/use-cases/list-request-applications.use-case';
import { DecideApplicationUseCase } from './application/use-cases/decide-application.use-case';
import {
  ApplicationsController,
  RequestApplicationsController,
} from './presentation/http/controllers/applications.controller';
import { APPLICATION_REPOSITORY } from './applications.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidatureOrmEntity]),
    IdentityModule,
    RequestsModule,
    MissionsModule,
  ],
  controllers: [ApplicationsController, RequestApplicationsController],
  providers: [
    {
      provide: APPLICATION_REPOSITORY,
      useClass: TypeOrmApplicationRepository,
    },
    {
      provide: TypeOrmApplicationRepository,
      useExisting: APPLICATION_REPOSITORY,
    },
    ApplyToRequestUseCase,
    ListMyApplicationsUseCase,
    GetMyApplicationUseCase,
    ListRequestApplicationsUseCase,
    DecideApplicationUseCase,
  ],
})
export class ApplicationsModule {}
