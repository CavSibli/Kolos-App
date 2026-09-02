import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatutVerificationOrmEntity } from './infrastructure/typeorm/entities/statut-verification.orm-entity';
import { StatutDemandeOrmEntity } from './infrastructure/typeorm/entities/statut-demande.orm-entity';
import { StatutCandidatureOrmEntity } from './infrastructure/typeorm/entities/statut-candidature.orm-entity';
import { TypeOrmStatusLookupRepository } from './infrastructure/typeorm/repositories/typeorm-status-lookup.repository';
import { STATUS_LOOKUP } from './reference-data.tokens';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      StatutVerificationOrmEntity,
      StatutDemandeOrmEntity,
      StatutCandidatureOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: STATUS_LOOKUP,
      useClass: TypeOrmStatusLookupRepository,
    },
    {
      provide: TypeOrmStatusLookupRepository,
      useExisting: STATUS_LOOKUP,
    },
  ],
  exports: [STATUS_LOOKUP, TypeOrmStatusLookupRepository],
})
export class ReferenceDataModule {}
