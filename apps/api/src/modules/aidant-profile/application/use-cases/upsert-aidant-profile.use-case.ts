import {
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AidantProfileRepository } from '../../domain/repositories/aidant-profile.repository';
import { AidantProfile } from '../../domain/entities/aidant-profile.entity';
import { RayonIntervention } from '../../domain/value-objects/rayon-intervention.vo';
import { CLOCK } from '@modules/identity/identity.tokens';
import type { ClockPort } from '@modules/identity/application/ports/clock.port';
import { AIDANT_PROFILE_REPOSITORY } from '../../aidant-profile.tokens';
import {
  AidantProfileResult,
  UpsertAidantProfileCommand,
} from '../dto/upsert-aidant-profile.command';

@Injectable()
export class UpsertAidantProfileUseCase {
  constructor(
    @Inject(AIDANT_PROFILE_REPOSITORY)
    private readonly profileRepository: AidantProfileRepository,
    @Inject(CLOCK)
    private readonly clock: ClockPort,
  ) {}

  async execute(command: UpsertAidantProfileCommand): Promise<AidantProfileResult> {
    const rayon = RayonIntervention.create(command.rayonIntervention);
    const bio = command.bio?.trim() || null;
    const now = this.clock.now();

    const existing = await this.profileRepository.findByUserId(command.userId);
    const profile = existing
      ? existing.update({ bio, rayonIntervention: rayon, now })
      : AidantProfile.create({
          userId: command.userId,
          bio,
          rayonIntervention: rayon,
          now,
        });

    const saved = await this.profileRepository.save(profile);
    return this.toResult(saved);
  }

  private toResult(profile: AidantProfile): AidantProfileResult {
    if (profile.id === undefined) {
      throw new ForbiddenException('Profile could not be persisted');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      rayonIntervention: profile.rayonIntervention.toNumber(),
      verificationStatus: profile.verificationStatusCode,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
