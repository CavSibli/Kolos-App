import { UserOrmEntity } from '../entities/user.orm-entity';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Email } from '../../../domain/value-objects/email.vo';
import { PasswordHash } from '../../../domain/value-objects/password-hash.vo';
import { Role } from '../../../domain/entities/role.entity';
import type { UserRole } from '@kolos/shared-types';

export class UserOrmMapper {
  static toDomain(entity: UserOrmEntity): User {
    return new User({
      id: UserId.create(entity.id),
      email: Email.create(entity.email),
      passwordHash: PasswordHash.fromHash(entity.passwordHash),
      firstName: entity.firstName,
      lastName: entity.lastName,
      roles: (entity.roles ?? []).map(
        (role) =>
          new Role({
            id: role.id,
            name: role.name as UserRole,
          }),
      ),
      createdAt: entity.createdAt,
      bannedAt: entity.bannedAt ?? null,
      banUntil: entity.banUntil ?? null,
      banReason: entity.banReason ?? null,
    });
  }

  static toOrm(user: User): Partial<UserOrmEntity> {
    return {
      id: user.id.toString(),
      email: user.email.toString(),
      passwordHash: user.passwordHash.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      bannedAt: user.bannedAt,
      banUntil: user.banUntil,
      banReason: user.banReason,
    };
  }
}
