import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoleOrmEntity } from '@modules/identity/infrastructure/typeorm/entities/role.orm-entity';
import { UserOrmEntity } from '@modules/identity/infrastructure/typeorm/entities/user.orm-entity';
import { RefreshTokenOrmEntity } from '@modules/identity/infrastructure/typeorm/entities/refresh-token.orm-entity';

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
        entities: [UserOrmEntity, RoleOrmEntity, RefreshTokenOrmEntity],
        synchronize: false,
        migrationsRun: false,
      }),
    }),
  ],
})
export class PostgresModule {}
