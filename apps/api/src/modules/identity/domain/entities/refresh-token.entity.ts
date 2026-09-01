import { UserId } from '../value-objects/user-id.vo';

export interface RefreshTokenProps {
  id: string;
  userId: UserId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
  createdAt: Date;
}

export class RefreshToken {
  constructor(private readonly props: RefreshTokenProps) {}

  get id(): string {
    return this.props.id;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | null {
    return this.props.revokedAt;
  }

  get replacedByTokenId(): string | null {
    return this.props.replacedByTokenId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isActive(now: Date): boolean {
    return !this.props.revokedAt && this.props.expiresAt > now;
  }

  revoke(now: Date, replacedByTokenId?: string): RefreshToken {
    return new RefreshToken({
      ...this.props,
      revokedAt: now,
      replacedByTokenId: replacedByTokenId ?? this.props.replacedByTokenId,
    });
  }
}
