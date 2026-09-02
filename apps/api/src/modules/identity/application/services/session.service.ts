import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { TokenIssuerPort } from '../ports/token-issuer.port';
import { ClockPort } from '../ports/clock.port';
import { AuthResult } from '../dto/auth.dto';
import {
  CLOCK,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_ISSUER,
} from '../../identity.tokens';

@Injectable()
export class SessionService {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKEN_ISSUER)
    private readonly tokenIssuer: TokenIssuerPort,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async createSession(user: User): Promise<AuthResult> {
    const tokenId = randomUUID();
    const access = await this.tokenIssuer.issueAccessToken({
      userId: user.id.toString(),
      email: user.email.toString(),
      roles: user.roles.map((role) => role.name),
      sessionId: tokenId,
    });

    const refresh = await this.tokenIssuer.issueRefreshToken({
      userId: user.id.toString(),
      tokenId,
    });

    const tokenHash = this.tokenIssuer.hashRefreshToken(refresh.token);
    const now = this.clock.now();

    const refreshEntity = new RefreshToken({
      id: tokenId,
      userId: user.id,
      tokenHash,
      expiresAt: refresh.expiresAt,
      revokedAt: null,
      replacedByTokenId: null,
      createdAt: now,
    });

    await this.refreshTokenRepository.save(refreshEntity);

    return this.toAuthResult(user, access.token, access.expiresInSeconds, refresh.token, tokenId, refresh.expiresAt);
  }

  async rotateSession(
    user: User,
    existingTokenId: string,
    existingRefreshToken: string,
  ): Promise<AuthResult> {
    const now = this.clock.now();
    const existingHash = this.tokenIssuer.hashRefreshToken(existingRefreshToken);
    const stored = await this.refreshTokenRepository.findByTokenHash(existingHash);

    if (!stored || stored.id !== existingTokenId) {
      await this.refreshTokenRepository.revokeAllForUser(user.id, now);
      throw new Error('Invalid refresh token');
    }

    if (!stored.isActive(now)) {
      if (stored.revokedAt && stored.replacedByTokenId) {
        await this.refreshTokenRepository.revokeAllForUser(user.id, now);
      }
      throw new Error('Refresh token expired or revoked');
    }

    const newTokenId = randomUUID();
    const access = await this.tokenIssuer.issueAccessToken({
      userId: user.id.toString(),
      email: user.email.toString(),
      roles: user.roles.map((role) => role.name),
      sessionId: newTokenId,
    });

    const refresh = await this.tokenIssuer.issueRefreshToken({
      userId: user.id.toString(),
      tokenId: newTokenId,
    });

    const revoked = stored.revoke(now, newTokenId);
    await this.refreshTokenRepository.save(revoked);

    const newRefreshEntity = new RefreshToken({
      id: newTokenId,
      userId: user.id,
      tokenHash: this.tokenIssuer.hashRefreshToken(refresh.token),
      expiresAt: refresh.expiresAt,
      revokedAt: null,
      replacedByTokenId: null,
      createdAt: now,
    });

    await this.refreshTokenRepository.save(newRefreshEntity);

    return this.toAuthResult(
      user,
      access.token,
      access.expiresInSeconds,
      refresh.token,
      newTokenId,
      refresh.expiresAt,
    );
  }

  async revokeByToken(refreshToken: string): Promise<void> {
    const now = this.clock.now();
    const tokenHash = this.tokenIssuer.hashRefreshToken(refreshToken);
    const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (stored && stored.isActive(now)) {
      await this.refreshTokenRepository.save(stored.revoke(now));
    }
  }

  private toAuthResult(
    user: User,
    accessToken: string,
    expiresIn: number,
    refreshToken: string,
    refreshTokenId: string,
    refreshExpiresAt: Date,
  ): AuthResult {
    return {
      accessToken,
      expiresIn,
      refreshToken,
      refreshTokenId,
      refreshExpiresAt,
      user: {
        id: user.id.toString(),
        email: user.email.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((role) => role.name),
      },
    };
  }
}
