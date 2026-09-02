import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '@modules/identity/identity.module';
import { DemandeOrmEntity } from './infrastructure/typeorm/entities/demande.orm-entity';
import { TypeOrmRequestRepository } from './infrastructure/typeorm/repositories/typeorm-request.repository';
import { PublishRequestUseCase } from './application/use-cases/publish-request.use-case';
import { ListPublishedRequestsUseCase } from './application/use-cases/list-published-requests.use-case';
import { RequestsController } from './presentation/http/controllers/requests.controller';
import { REQUEST_REPOSITORY } from './requests.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([DemandeOrmEntity]), IdentityModule],
  controllers: [RequestsController],
  providers: [
    {
      provide: REQUEST_REPOSITORY,
      useClass: TypeOrmRequestRepository,
    },
    {
      provide: TypeOrmRequestRepository,
      useExisting: REQUEST_REPOSITORY,
    },
    PublishRequestUseCase,
    ListPublishedRequestsUseCase,
  ],
  exports: [REQUEST_REPOSITORY],
})
export class RequestsModule {}
