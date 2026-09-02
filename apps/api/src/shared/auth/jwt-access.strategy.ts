import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { REFRESH_TOKEN_REPOSITORY, CLOCK } from '@modules/identity/identity.tokens';
import type { RefreshTokenRepository } from '@modules/identity/domain/repositories/refresh-token.repository';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  sid?: string;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    configService: ConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.accessSecret'),
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException();
    }

    if (payload.sid) {
      const session = await this.refreshTokenRepository.findById(payload.sid);
      if (!session || !session.isActive(this.clock.now())) {
        throw new UnauthorizedException();
      }
    }

    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
    };
  }
}

export function extractRefreshTokenFromCookie(
  cookieName: string,
): (req: Request) => string | null {
  return (req: Request) => {
    const cookies = req.cookies as Record<string, string> | undefined;
    return cookies?.[cookieName] ?? null;
  };
}
