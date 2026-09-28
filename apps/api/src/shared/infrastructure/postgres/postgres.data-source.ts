import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import { UserOrmEntity } from '../../../modules/identity/infrastructure/typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from '../../../modules/identity/infrastructure/typeorm/entities/role.orm-entity';
import { RefreshTokenOrmEntity } from '../../../modules/identity/infrastructure/typeorm/entities/refresh-token.orm-entity';
import { StatutVerificationOrmEntity } from '../../reference-data/infrastructure/typeorm/entities/statut-verification.orm-entity';
import { StatutDemandeOrmEntity } from '../../reference-data/infrastructure/typeorm/entities/statut-demande.orm-entity';
import { StatutCandidatureOrmEntity } from '../../reference-data/infrastructure/typeorm/entities/statut-candidature.orm-entity';
import { ProfilAidantOrmEntity } from '../../../modules/aidant-profile/infrastructure/typeorm/entities/profil-aidant.orm-entity';
import { DemandeOrmEntity } from '../../../modules/requests/infrastructure/typeorm/entities/demande.orm-entity';
import { CandidatureOrmEntity } from '../../../modules/applications/infrastructure/typeorm/entities/candidature.orm-entity';
import { StatutMissionOrmEntity } from '../../reference-data/infrastructure/typeorm/entities/statut-mission.orm-entity';
import { StatutParticipationOrmEntity } from '../../reference-data/infrastructure/typeorm/entities/statut-participation.orm-entity';
import { MissionOrmEntity } from '../../../modules/missions/infrastructure/typeorm/entities/mission.orm-entity';
import { ParticipationOrmEntity } from '../../../modules/missions/infrastructure/typeorm/entities/participation.orm-entity';
import { TypeSignalementOrmEntity } from '../../reference-data/infrastructure/typeorm/entities/type-signalement.orm-entity';
import { StatutSignalementOrmEntity } from '../../reference-data/infrastructure/typeorm/entities/statut-signalement.orm-entity';
import { PrioriteSignalementOrmEntity } from '../../reference-data/infrastructure/typeorm/entities/priorite-signalement.orm-entity';
import { SignalementOrmEntity } from '../../../modules/reports/infrastructure/typeorm/entities/signalement.orm-entity';

const envPaths = [
  resolve(process.cwd(), '../../.env'),
  resolve(process.cwd(), '../../.env.local'),
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '.env.local'),
];

for (const envPath of envPaths) {
  config({ path: envPath });
}

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'kolos',
  password: process.env.POSTGRES_PASSWORD ?? 'kolos_dev_password',
  database: process.env.POSTGRES_DB ?? 'kolos_identity',
  ssl: process.env.POSTGRES_SSL === 'true',
  entities: [
    UserOrmEntity,
    RoleOrmEntity,
    RefreshTokenOrmEntity,
    StatutVerificationOrmEntity,
    StatutDemandeOrmEntity,
    StatutCandidatureOrmEntity,
    StatutMissionOrmEntity,
    StatutParticipationOrmEntity,
    TypeSignalementOrmEntity,
    StatutSignalementOrmEntity,
    PrioriteSignalementOrmEntity,
    ProfilAidantOrmEntity,
    DemandeOrmEntity,
    CandidatureOrmEntity,
    MissionOrmEntity,
    ParticipationOrmEntity,
    SignalementOrmEntity,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
};

export default new DataSource(options);
