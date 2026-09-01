import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshSessionCommand } from '../dto/refresh-session.command';
import { AuthResult } from '../dto/auth.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { SessionService } from '../services/session.service';
import { USER_REPOSITORY } from '../../identity.tokens';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
  ) {}

  async execute(command: RefreshSessionCommand): Promise<AuthResult> {
    const user = await this.userRepository.findById(
      UserId.create(command.userId),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      return await this.sessionService.rotateSession(
        user,
        command.tokenId,
        command.refreshToken,
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
