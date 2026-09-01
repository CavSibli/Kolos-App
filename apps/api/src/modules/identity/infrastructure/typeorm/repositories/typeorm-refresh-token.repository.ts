import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { RefreshTokenOrmEntity } from '../entities/refresh-token.orm-entity';
import { RefreshTokenOrmMapper } from '../mappers/refresh-token.orm-mapper';

@Injectable()
export class TypeOrmRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly tokenRepo: Repository<RefreshTokenOrmEntity>,
  ) {}

  async findById(id: string): Promise<RefreshToken | null> {
    const entity = await this.tokenRepo.findOne({ where: { id } });
    return entity ? RefreshTokenOrmMapper.toDomain(entity) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const entity = await this.tokenRepo.findOne({ where: { tokenHash } });
    return entity ? RefreshTokenOrmMapper.toDomain(entity) : null;
  }

  async save(token: RefreshToken): Promise<RefreshToken> {
    const partial = RefreshTokenOrmMapper.toOrm(token);
    const existing = partial.id
      ? await this.tokenRepo.findOne({ where: { id: partial.id } })
      : null;

    const entity = existing
      ? Object.assign(existing, partial)
      : this.tokenRepo.create(partial);

    const saved = await this.tokenRepo.save(entity);
    return RefreshTokenOrmMapper.toDomain(saved);
  }

  async revokeAllForUser(userId: UserId, now: Date): Promise<void> {
    await this.tokenRepo.update(
      { userId: userId.toString(), revokedAt: null as unknown as undefined },
      { revokedAt: now },
    );
  }
}
