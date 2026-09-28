import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { UserOrmMapper } from '../mappers/user.orm-mapper';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
  ) {}

  async findById(id: UserId): Promise<User | null> {
    const entity = await this.userRepo.findOne({
      where: { id: id.toString() },
      relations: ['roles'],
    });
    return entity ? UserOrmMapper.toDomain(entity) : null;
  }

  async findByIds(ids: UserId[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }

    const uniqueIds = [...new Set(ids.map((id) => id.toString()))];
    const entities = await this.userRepo.find({
      where: { id: In(uniqueIds) },
      relations: ['roles'],
    });

    return entities.map((entity) => UserOrmMapper.toDomain(entity));
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.userRepo.findOne({
      where: { email: email.toString() },
      relations: ['roles'],
    });
    return entity ? UserOrmMapper.toDomain(entity) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.userRepo.count({
      where: { email: email.toString() },
    });
    return count > 0;
  }

  async listForAdmin(options: {
    page: number;
    pageSize: number;
    q?: string;
    role?: string;
    banned?: boolean;
  }): Promise<{ items: User[]; total: number; page: number; pageSize: number }> {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.roles', 'r')
      .orderBy('u.createdAt', 'DESC')
      .skip((options.page - 1) * options.pageSize)
      .take(options.pageSize);

    if (options.q?.trim()) {
      const q = `%${options.q.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(u.email) LIKE :q OR LOWER(u.firstName) LIKE :q OR LOWER(u.lastName) LIKE :q)',
        { q },
      );
    }

    if (options.role) {
      qb.andWhere('r.name = :role', { role: options.role });
    }

    if (options.banned === true) {
      qb.andWhere('u.bannedAt IS NOT NULL').andWhere(
        '(u.banUntil IS NULL OR u.banUntil > NOW())',
      );
    } else if (options.banned === false) {
      qb.andWhere(
        '(u.bannedAt IS NULL OR (u.banUntil IS NOT NULL AND u.banUntil <= NOW()))',
      );
    }

    const [entities, total] = await qb.getManyAndCount();

    return {
      items: entities.map((entity) => UserOrmMapper.toDomain(entity)),
      total,
      page: options.page,
      pageSize: options.pageSize,
    };
  }

  async save(user: User): Promise<User> {
    const partial = UserOrmMapper.toOrm(user);
    let entity = partial.id
      ? await this.userRepo.findOne({
          where: { id: partial.id },
          relations: ['roles'],
        })
      : null;

    if (!entity) {
      entity = this.userRepo.create(partial);
    } else {
      Object.assign(entity, partial);
    }

    if (user.roles.length > 0) {
      const roleNames = user.roles.map((role) => role.name);
      entity.roles = await this.roleRepo.findBy(
        roleNames.map((name) => ({ name })),
      );
    }

    const saved = await this.userRepo.save(entity);
    const reloaded = await this.userRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['roles'],
    });

    return UserOrmMapper.toDomain(reloaded);
  }
}
