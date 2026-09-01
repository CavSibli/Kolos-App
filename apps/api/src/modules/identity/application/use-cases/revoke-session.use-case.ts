import { Injectable } from '@nestjs/common';
import { SessionService } from '../services/session.service';

@Injectable()
export class RevokeSessionUseCase {
  constructor(private readonly sessionService: SessionService) {}

  async execute(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.sessionService.revokeByToken(refreshToken);
    }
  }
}
