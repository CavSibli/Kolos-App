import { RefreshToken } from '../entities/refresh-token.entity';
import { UserId } from '../value-objects/user-id.vo';

export interface RefreshTokenRepository {
  findById(id: string): Promise<RefreshToken | null>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  save(token: RefreshToken): Promise<RefreshToken>;
  revokeAllForUser(userId: UserId, now: Date): Promise<void>;
}
