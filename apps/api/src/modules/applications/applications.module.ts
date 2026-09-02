import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '@modules/identity/identity.module';
import { RequestsModule } from '@modules/requests/requests.module';
import { CandidatureOrmEntity } from './infrastructure/typeorm/entities/candidature.orm-entity';
import { TypeOrmApplicationRepository } from './infrastructure/typeorm/repositories/typeorm-application.repository';
import { ApplyToRequestUseCase } from './application/use-cases/apply-to-request.use-case';
import { ApplicationsController } from './presentation/http/controllers/applications.controller';
import { APPLICATION_REPOSITORY } from './applications.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidatureOrmEntity]),
    IdentityModule,
    RequestsModule,
  ],
  controllers: [ApplicationsController],
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
  ],
})
export class ApplicationsModule {}
