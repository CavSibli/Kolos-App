import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { UserRole } from '@kolos/shared-types';
import { USER_REPOSITORY, ROLE_REPOSITORY, PASSWORD_HASHER, CLOCK, REFRESH_TOKEN_REPOSITORY } from '@modules/identity/identity.tokens';
import type { UserRepository } from '@modules/identity/domain/repositories/user.repository';
import type { RoleRepository } from '@modules/identity/domain/repositories/role.repository';
import type { RefreshTokenRepository } from '@modules/identity/domain/repositories/refresh-token.repository';
import type { PasswordHasherPort } from '@modules/identity/application/ports/password-hasher.port';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import { Email } from '@modules/identity/domain/value-objects/email.vo';
import { UserId } from '@modules/identity/domain/value-objects/user-id.vo';
import { PasswordHash } from '@modules/identity/domain/value-objects/password-hash.vo';
import { User } from '@modules/identity/domain/entities/user.entity';
import { Role } from '@modules/identity/domain/entities/role.entity';

const ALLOWED_CREATE_ROLES: UserRole[] = ['demandeur', 'aidant'];

function toAdminUser(user: User, now: Date) {
  return {
    id: user.id.toString(),
    email: user.email.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles.map((role) => role.name),
    createdAt: user.createdAt.toISOString(),
    banned: user.isBanned(now),
    bannedAt: user.bannedAt?.toISOString() ?? null,
    banUntil: user.banUntil?.toISOString() ?? null,
    banReason: user.banReason,
  };
}

@Injectable()
export class ListAdminUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(query: {
    page?: number;
    pageSize?: number;
    q?: string;
    role?: string;
    banned?: boolean;
  }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const result = await this.users.listForAdmin({
      page,
      pageSize,
      q: query.q,
      role: query.role,
      banned: query.banned,
    });
    const now = this.clock.now();
    return {
      items: result.items.map((user) => toAdminUser(user, now)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}

@Injectable()
export class GetAdminUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(id: string) {
    const user = await this.users.findById(UserId.create(id));
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return toAdminUser(user, this.clock.now());
  }
}

@Injectable()
export class CreateAdminUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(command: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) {
    if (!ALLOWED_CREATE_ROLES.includes(command.role)) {
      throw new BadRequestException('Seuls demandeur et aidant peuvent être créés');
    }
    const email = Email.create(command.email);
    if (await this.users.existsByEmail(email)) {
      throw new ConflictException('Email déjà utilisé');
    }
    const roleEntity = await this.roles.findByName(command.role);
    if (!roleEntity) {
      throw new BadRequestException(`Rôle ${command.role} introuvable`);
    }
    const user = new User({
      id: UserId.create(randomUUID()),
      email,
      passwordHash: PasswordHash.fromHash(
        await this.hasher.hash(command.password),
      ),
      firstName: command.firstName.trim(),
      lastName: command.lastName.trim(),
      roles: [new Role({ id: roleEntity.id, name: roleEntity.name })],
      createdAt: this.clock.now(),
      bannedAt: null,
      banUntil: null,
      banReason: null,
    });
    const saved = await this.users.save(user);
    return toAdminUser(saved, this.clock.now());
  }
}

@Injectable()
export class UpdateAdminUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(
    id: string,
    command: {
      firstName?: string;
      lastName?: string;
      email?: string;
      roles?: UserRole[];
    },
  ) {
    const user = await this.users.findById(UserId.create(id));
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    let nextRoles = user.roles;
    if (command.roles) {
      if (command.roles.some((role) => role === 'admin') && !user.roles.some((r) => r.name === 'admin')) {
        throw new ForbiddenException('Attribution du rôle admin interdite ici');
      }
      const resolved: Role[] = [];
      for (const name of command.roles) {
        if (name === 'admin') {
          const existing = user.roles.find((r) => r.name === 'admin');
          if (existing) resolved.push(existing);
          continue;
        }
        const roleEntity = await this.roles.findByName(name);
        if (!roleEntity) {
          throw new BadRequestException(`Rôle ${name} introuvable`);
        }
        resolved.push(new Role({ id: roleEntity.id, name: roleEntity.name }));
      }
      nextRoles = resolved;
    }

    let nextEmail = user.email;
    if (command.email && command.email !== user.email.toString()) {
      nextEmail = Email.create(command.email);
      if (await this.users.existsByEmail(nextEmail)) {
        throw new ConflictException('Email déjà utilisé');
      }
    }

    const updated = await this.users.save(
      user.withProfile({
        firstName: command.firstName?.trim(),
        lastName: command.lastName?.trim(),
        email: nextEmail,
        roles: nextRoles,
      }),
    );
    return toAdminUser(updated, this.clock.now());
  }
}

@Injectable()
export class BanAdminUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokens: RefreshTokenRepository,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(
    id: string,
    adminId: string,
    command: { until?: string | null; reason?: string },
  ) {
    if (id === adminId) {
      throw new ForbiddenException('Auto-ban interdit');
    }
    const user = await this.users.findById(UserId.create(id));
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (user.roles.some((role) => role.name === 'admin')) {
      throw new ForbiddenException('Impossible de bannir un admin');
    }

    const now = this.clock.now();
    let until: Date | null = null;
    if (command.until) {
      until = new Date(command.until);
      if (Number.isNaN(until.getTime()) || until.getTime() <= now.getTime()) {
        throw new BadRequestException('ban_until invalide');
      }
    }

    const banned = await this.users.save(
      user.ban({
        now,
        until,
        reason: command.reason?.trim() || null,
      }),
    );
    await this.refreshTokens.revokeAllForUser(banned.id, now);
    return toAdminUser(banned, now);
  }
}

@Injectable()
export class UnbanAdminUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(id: string) {
    const user = await this.users.findById(UserId.create(id));
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const updated = await this.users.save(user.unban());
    return toAdminUser(updated, this.clock.now());
  }
}
