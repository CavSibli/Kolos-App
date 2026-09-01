import { RefreshTokenOrmEntity } from '../entities/refresh-token.orm-entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';

export class RefreshTokenOrmMapper {
  static toDomain(entity: RefreshTokenOrmEntity): RefreshToken {
    return new RefreshToken({
      id: entity.id,
      userId: UserId.create(entity.userId),
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      replacedByTokenId: entity.replacedByTokenId,
      createdAt: entity.createdAt,
    });
  }

  static toOrm(token: RefreshToken): Partial<RefreshTokenOrmEntity> {
    return {
      id: token.id,
      userId: token.userId.toString(),
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      revokedAt: token.revokedAt,
      replacedByTokenId: token.replacedByTokenId,
      createdAt: token.createdAt,
    };
  }
}
