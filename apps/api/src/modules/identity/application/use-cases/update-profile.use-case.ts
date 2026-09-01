import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileCommand } from '../dto/update-profile.command';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { AuthResult } from '../dto/auth.dto';
import { USER_REPOSITORY } from '../../identity.tokens';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<AuthResult['user']> {
    const user = await this.userRepository.findById(
      UserId.create(command.userId),
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = user.updateProfile(
      command.firstName?.trim() ?? user.firstName,
      command.lastName?.trim() ?? user.lastName,
    );

    const saved = await this.userRepository.save(updated);

    return {
      id: saved.id.toString(),
      email: saved.email.toString(),
      firstName: saved.firstName,
      lastName: saved.lastName,
      roles: saved.roles.map((role) => role.name),
    };
  }
}
