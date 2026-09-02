import { BadRequestException } from '@nestjs/common';
import { UpsertAidantProfileUseCase } from './upsert-aidant-profile.use-case';
import { AidantProfile } from '../../domain/entities/aidant-profile.entity';

describe('UpsertAidantProfileUseCase', () => {
  const profileRepository = {
    findByUserId: jest.fn(),
    save: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(new Date('2026-09-01T10:00:00.000Z')),
  };

  const useCase = new UpsertAidantProfileUseCase(
    profileRepository as never,
    clock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    profileRepository.findByUserId.mockResolvedValue(null);
    profileRepository.save.mockImplementation(async (profile: AidantProfile) => {
      return new AidantProfile({
        id: 1,
        userId: profile.userId,
        bio: profile.bio,
        rayonIntervention: profile.rayonIntervention,
        verificationStatusCode: profile.verificationStatusCode,
        verifiedAt: profile.verifiedAt,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });
    });
  });

  it('creates a new aidant profile', async () => {
    const result = await useCase.execute({
      userId: 'aidant-1',
      bio: 'Aide aux courses',
      rayonIntervention: 15,
    });

    expect(profileRepository.save).toHaveBeenCalled();
    expect(result.rayonIntervention).toBe(15);
    expect(result.verificationStatus).toBe('NOT_VERIFIED');
  });

  it('rejects invalid rayon', async () => {
    await expect(
      useCase.execute({
        userId: 'aidant-1',
        rayonIntervention: 0,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
