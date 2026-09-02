export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  accessExpiresInSeconds: number;
  refreshExpiresAt: Date;
}

export interface TokenIssuerPort {
  issueAccessToken(payload: {
    userId: string;
    email: string;
    roles: string[];
    sessionId: string;
  }): Promise<{ token: string; expiresInSeconds: number }>;

  issueRefreshToken(payload: {
    userId: string;
    tokenId: string;
  }): Promise<{ token: string; expiresAt: Date }>;

  hashRefreshToken(token: string): string;
}
