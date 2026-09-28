import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthorizePaymentUseCase } from './authorize-payment.use-case';
import { Mission } from '../../domain/entities/mission.entity';
import { Request } from '@modules/requests/domain/entities/request.entity';

describe('AuthorizePaymentUseCase', () => {
  const now = new Date('2026-09-28T10:00:00.000Z');

  const mission = new Mission({
    id: 5,
    demandeId: 10,
    statusCode: 'AWAITING_PAYMENT',
    montantTotal: 25,
    dateDebut: null,
    dateFin: null,
    createdAt: now,
    updatedAt: now,
  });

  const request = new Request({
    id: 10,
    demandeurId: 'demandeur-1',
    statusCode: 'ASSIGNED',
    titre: 'Aide',
    description: 'Description',
    contraintesPhysiques: null,
    adresse: 'Paris',
    latitude: null,
    longitude: null,
    dateMission: new Date('2030-01-01'),
    dureeEstimee: 60,
    nbAidantsRequis: 1,
    budgetEstime: null,
    createdAt: now,
    updatedAt: now,
  });

  const missionRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const requestRepository = {
    findById: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(now),
  };

  const useCase = new AuthorizePaymentUseCase(
    missionRepository as never,
    requestRepository as never,
    clock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    missionRepository.findById.mockResolvedValue(mission);
    requestRepository.findById.mockResolvedValue(request);
    missionRepository.save.mockImplementation(async (m: Mission) => m);
    clock.now.mockReturnValue(now);
  });

  it('authorizes payment for mission owner (AWAITING_PAYMENT → CONFIRMED)', async () => {
    const result = await useCase.execute({
      missionId: 5,
      demandeurId: 'demandeur-1',
    });

    expect(missionRepository.save).toHaveBeenCalledTimes(1);
    const savedMission = missionRepository.save.mock.calls[0][0] as Mission;
    expect(savedMission.statusCode).toBe('CONFIRMED');
    expect(result).toEqual({
      missionId: 5,
      status: 'CONFIRMED',
      montantTotal: 25,
    });
  });

  it('forbids non-owner demandeur', async () => {
    await expect(
      useCase.execute({
        missionId: 5,
        demandeurId: 'other-demandeur',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(missionRepository.save).not.toHaveBeenCalled();
  });

  it('rejects when mission is not awaiting payment', async () => {
    missionRepository.findById.mockResolvedValue(
      mission.withStatus('CONFIRMED', now),
    );

    await expect(
      useCase.execute({
        missionId: 5,
        demandeurId: 'demandeur-1',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('throws when mission is missing', async () => {
    missionRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        missionId: 999,
        demandeurId: 'demandeur-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
