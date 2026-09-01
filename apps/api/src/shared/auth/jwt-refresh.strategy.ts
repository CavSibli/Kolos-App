import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { extractRefreshTokenFromCookie } from './jwt-access.strategy';

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    const cookieName =
      configService.get<string>('auth.refreshCookieName') ?? 'kolos_refresh';

    super({
      jwtFromRequest: extractRefreshTokenFromCookie(cookieName),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.refreshSecret'),
      passReqToCallback: true,
    } as ConstructorParameters<typeof Strategy>[0]);
  }

  validate(req: Request, payload: RefreshTokenPayload) {
    const cookieName =
      this.configService.get<string>('auth.refreshCookieName') ??
      'kolos_refresh';
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.[cookieName];

    if (!payload?.sub || !payload?.jti || !refreshToken) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.sub,
      tokenId: payload.jti,
      refreshToken,
    };
  }
}
