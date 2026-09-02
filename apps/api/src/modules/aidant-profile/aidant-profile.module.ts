import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '@modules/identity/identity.module';
import { ProfilAidantOrmEntity } from './infrastructure/typeorm/entities/profil-aidant.orm-entity';
import { TypeOrmAidantProfileRepository } from './infrastructure/typeorm/repositories/typeorm-aidant-profile.repository';
import { UpsertAidantProfileUseCase } from './application/use-cases/upsert-aidant-profile.use-case';
import { AidantProfileController } from './presentation/http/controllers/aidant-profile.controller';
import { AIDANT_PROFILE_REPOSITORY } from './aidant-profile.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([ProfilAidantOrmEntity]), IdentityModule],
  controllers: [AidantProfileController],
  providers: [
    {
      provide: AIDANT_PROFILE_REPOSITORY,
      useClass: TypeOrmAidantProfileRepository,
    },
    {
      provide: TypeOrmAidantProfileRepository,
      useExisting: AIDANT_PROFILE_REPOSITORY,
    },
    UpsertAidantProfileUseCase,
  ],
  exports: [AIDANT_PROFILE_REPOSITORY],
})
export class AidantProfileModule {}
