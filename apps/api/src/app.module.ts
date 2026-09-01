import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import configuration from './shared/config/configuration';
import { envValidationSchema } from './shared/config/env.validation';
import { PostgresModule } from './shared/infrastructure/postgres/postgres.module';
import { MongoModule } from './shared/infrastructure/mongo/mongo.module';
import { HealthModule } from './shared/presentation/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { AllExceptionsFilter } from './shared/presentation/common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('app.throttleTtl') ?? 60000,
            limit: configService.get<number>('app.throttleLimit') ?? 10,
          },
        ],
      }),
    }),
    PostgresModule,
    MongoModule,
    HealthModule,
    IdentityModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
