import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginCommand } from '../dto/login.command';
import { AuthResult } from '../dto/auth.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasherPort } from '../ports/password-hasher.port';
import { Email } from '../../domain/value-objects/email.vo';
import { SessionService } from '../services/session.service';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../identity.tokens';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    private readonly sessionService: SessionService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResult> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash.toString(),
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.sessionService.createSession(user);
  }
}
