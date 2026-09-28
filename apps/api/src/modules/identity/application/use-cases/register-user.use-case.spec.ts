import { ConflictException } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.use-case';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/entities/role.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';

describe('RegisterUserUseCase', () => {
  const userRepository = {
    existsByEmail: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
  };

  const passwordHasher = {
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
  };

  const sessionService = {
    createSession: jest.fn().mockResolvedValue({
      accessToken: 'access',
      expiresIn: 900,
      refreshToken: 'refresh',
      refreshTokenId: 'token-id',
      refreshExpiresAt: new Date('2026-02-01T00:00:00.000Z'),
      user: {
        id: 'user-id',
        email: 'test@kolos.local',
        firstName: 'Test',
        lastName: 'User',
        roles: ['demandeur'],
      },
    }),
  };

  const roleRepository = {
    findByName: jest.fn().mockResolvedValue(
      new Role({ id: 1, name: 'demandeur' }),
    ),
  };

  const useCase = new RegisterUserUseCase(
    userRepository as never,
    passwordHasher as never,
    clock as never,
    sessionService as never,
    roleRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new demandeur', async () => {
    userRepository.existsByEmail.mockResolvedValue(false);
    userRepository.save.mockImplementation(async (user: User) => user);

    const result = await useCase.execute({
      email: 'test@kolos.local',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'demandeur',
    });

    expect(userRepository.save).toHaveBeenCalled();
    expect(sessionService.createSession).toHaveBeenCalled();
    expect(result.accessToken).toBe('access');
  });

  it('throws when email already exists', async () => {
    userRepository.existsByEmail.mockResolvedValue(true);

    await expect(
      useCase.execute({
        email: 'test@kolos.local',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('LoginUseCase', () => {
  const user = new User({
    id: UserId.create('user-id'),
    email: Email.create('test@kolos.local'),
    passwordHash: PasswordHash.fromHash('hashed-password'),
    firstName: 'Test',
    lastName: 'User',
    roles: [new Role({ id: 1, name: 'demandeur' })],
    createdAt: new Date(),
    bannedAt: null,
    banUntil: null,
    banReason: null,
  });

  const userRepository = {
    findByEmail: jest.fn().mockResolvedValue(user),
    existsByEmail: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
  };

  const passwordHasher = {
    hash: jest.fn(),
    compare: jest.fn().mockResolvedValue(true),
  };

  const clock = {
    now: jest.fn().mockReturnValue(new Date('2026-09-28T21:00:00.000Z')),
  };

  const sessionService = {
    createSession: jest.fn().mockResolvedValue({
      accessToken: 'access',
      expiresIn: 900,
      refreshToken: 'refresh',
      refreshTokenId: 'token-id',
      refreshExpiresAt: new Date(),
      user: {
        id: 'user-id',
        email: 'test@kolos.local',
        firstName: 'Test',
        lastName: 'User',
        roles: ['demandeur'],
      },
    }),
  };

  const { LoginUseCase } = require('./login.use-case');
  const useCase = new LoginUseCase(
    userRepository as never,
    passwordHasher as never,
    clock as never,
    sessionService as never,
  );

  it('logs in with valid credentials', async () => {
    const result = await useCase.execute({
      email: 'test@kolos.local',
      password: 'Password123',
    });

    expect(result.accessToken).toBe('access');
    expect(sessionService.createSession).toHaveBeenCalledWith(user);
  });
});
