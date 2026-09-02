import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoleOrmEntity } from '@modules/identity/infrastructure/typeorm/entities/role.orm-entity';
import { UserOrmEntity } from '@modules/identity/infrastructure/typeorm/entities/user.orm-entity';
import { RefreshTokenOrmEntity } from '@modules/identity/infrastructure/typeorm/entities/refresh-token.orm-entity';
import { StatutVerificationOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/statut-verification.orm-entity';
import { StatutDemandeOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/statut-demande.orm-entity';
import { StatutCandidatureOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/statut-candidature.orm-entity';
import { ProfilAidantOrmEntity } from '@modules/aidant-profile/infrastructure/typeorm/entities/profil-aidant.orm-entity';
import { DemandeOrmEntity } from '@modules/requests/infrastructure/typeorm/entities/demande.orm-entity';
import { CandidatureOrmEntity } from '@modules/applications/infrastructure/typeorm/entities/candidature.orm-entity';
import { StatutMissionOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/statut-mission.orm-entity';
import { StatutParticipationOrmEntity } from '@shared/reference-data/infrastructure/typeorm/entities/statut-participation.orm-entity';
import { MissionOrmEntity } from '@modules/missions/infrastructure/typeorm/entities/mission.orm-entity';
import { ParticipationOrmEntity } from '@modules/missions/infrastructure/typeorm/entities/participation.orm-entity';

const postgresEntities = [
  UserOrmEntity,
  RoleOrmEntity,
  RefreshTokenOrmEntity,
  StatutVerificationOrmEntity,
  StatutDemandeOrmEntity,
  StatutCandidatureOrmEntity,
  StatutMissionOrmEntity,
  StatutParticipationOrmEntity,
  ProfilAidantOrmEntity,
  DemandeOrmEntity,
  CandidatureOrmEntity,
  MissionOrmEntity,
  ParticipationOrmEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('postgres.host'),
        port: configService.get<number>('postgres.port'),
        username: configService.get<string>('postgres.username'),
        password: configService.get<string>('postgres.password'),
        database: configService.get<string>('postgres.database'),
        ssl: configService.get<boolean>('postgres.ssl'),
        entities: postgresEntities,
        synchronize: false,
        migrationsRun: false,
      }),
    }),
  ],
})
export class PostgresModule {}
