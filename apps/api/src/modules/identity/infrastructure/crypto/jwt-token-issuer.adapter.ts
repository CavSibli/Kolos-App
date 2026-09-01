import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { TokenIssuerPort } from '../../application/ports/token-issuer.port';

@Injectable()
export class JwtTokenIssuer implements TokenIssuerPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueAccessToken(payload: {
    userId: string;
    email: string;
    roles: string[];
  }): Promise<{ token: string; expiresInSeconds: number }> {
    const ttl = this.configService.get<string>('auth.accessTtl') ?? '15m';
    const expiresInSeconds = this.parseTtlToSeconds(ttl);

    const token = await this.jwtService.signAsync(
      {
        sub: payload.userId,
        email: payload.email,
        roles: payload.roles,
      },
      {
        secret: this.configService.getOrThrow<string>('auth.accessSecret'),
        expiresIn: expiresInSeconds,
      },
    );

    return { token, expiresInSeconds };
  }

  async issueRefreshToken(payload: {
    userId: string;
    tokenId: string;
  }): Promise<{ token: string; expiresAt: Date }> {
    const ttl = this.configService.get<string>('auth.refreshTtl') ?? '30d';
    const expiresInSeconds = this.parseTtlToSeconds(ttl);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const token = await this.jwtService.signAsync(
      {
        sub: payload.userId,
        jti: payload.tokenId,
      },
      {
        secret: this.configService.getOrThrow<string>('auth.refreshSecret'),
        expiresIn: expiresInSeconds,
      },
    );

    return { token, expiresAt };
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseTtlToSeconds(ttl: string): number {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900;
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}
