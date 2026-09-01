import {
  ConflictException,
  Injectable,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { RegisterUserCommand, AuthResult } from '../dto/auth.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasherPort } from '../ports/password-hasher.port';
import { ClockPort } from '../ports/clock.port';
import {
  CLOCK,
  PASSWORD_HASHER,
  USER_REPOSITORY,
} from '../../identity.tokens';
import { Email } from '../../domain/value-objects/email.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/entities/role.entity';
import { RoleOrmEntity } from '../../infrastructure/typeorm/entities/role.orm-entity';
import { SessionService } from '../services/session.service';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
    private readonly sessionService: SessionService,
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthResult> {
    const email = Email.create(command.email);

    if (await this.userRepository.existsByEmail(email)) {
      throw new ConflictException('Email already registered');
    }

    const roleName = command.role ?? 'demandeur';
    const roleEntity = await this.roleRepo.findOne({ where: { name: roleName } });

    if (!roleEntity) {
      throw new BadRequestException(`Role ${roleName} not found`);
    }

    const passwordHash = PasswordHash.fromHash(
      await this.passwordHasher.hash(command.password),
    );

    const user = new User({
      id: UserId.create(randomUUID()),
      email,
      passwordHash,
      firstName: command.firstName.trim(),
      lastName: command.lastName.trim(),
      roles: [new Role({ id: roleEntity.id, name: roleEntity.name as 'demandeur' | 'aidant' | 'admin' })],
      createdAt: this.clock.now(),
    });

    const saved = await this.userRepository.save(user);
    return this.sessionService.createSession(saved);
  }
}
