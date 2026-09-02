import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from './infrastructure/typeorm/entities/role.orm-entity';
import { RefreshTokenOrmEntity } from './infrastructure/typeorm/entities/refresh-token.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/typeorm/repositories/typeorm-user.repository';
import { TypeOrmRefreshTokenRepository } from './infrastructure/typeorm/repositories/typeorm-refresh-token.repository';
import { TypeOrmRoleRepository } from './infrastructure/typeorm/repositories/typeorm-role.repository';
import { BcryptPasswordHasher } from './infrastructure/crypto/bcrypt-password-hasher.adapter';
import { JwtTokenIssuer } from './infrastructure/crypto/jwt-token-issuer.adapter';
import { SystemClock } from './infrastructure/clock/system-clock.adapter';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RevokeSessionUseCase } from './application/use-cases/revoke-session.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { SessionService } from './application/services/session.service';
import { AuthController } from './presentation/http/controllers/auth.controller';
import { MeController } from './presentation/http/controllers/me.controller';
import { AuthSharedModule } from '@shared/auth/auth-shared.module';
import {
  USER_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  ROLE_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_ISSUER,
  CLOCK,
} from './identity.tokens';

@Module({
  imports: [
    AuthSharedModule,
    TypeOrmModule.forFeature([
      UserOrmEntity,
      RoleOrmEntity,
      RefreshTokenOrmEntity,
    ]),
  ],
  controllers: [AuthController, MeController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: TypeOrmRefreshTokenRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: TypeOrmRoleRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_ISSUER,
      useClass: JwtTokenIssuer,
    },
    {
      provide: CLOCK,
      useClass: SystemClock,
    },
    {
      provide: TypeOrmUserRepository,
      useExisting: USER_REPOSITORY,
    },
    {
      provide: TypeOrmRefreshTokenRepository,
      useExisting: REFRESH_TOKEN_REPOSITORY,
    },
    {
      provide: TypeOrmRoleRepository,
      useExisting: ROLE_REPOSITORY,
    },
    {
      provide: BcryptPasswordHasher,
      useExisting: PASSWORD_HASHER,
    },
    {
      provide: JwtTokenIssuer,
      useExisting: TOKEN_ISSUER,
    },
    {
      provide: SystemClock,
      useExisting: CLOCK,
    },
    SessionService,
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    RevokeSessionUseCase,
    GetCurrentUserUseCase,
    UpdateProfileUseCase,
  ],
  exports: [USER_REPOSITORY, CLOCK],
})
export class IdentityModule {}
