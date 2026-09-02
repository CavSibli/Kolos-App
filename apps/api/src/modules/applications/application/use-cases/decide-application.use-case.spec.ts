import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { DecideApplicationUseCase } from './decide-application.use-case';
import { Application } from '../../domain/entities/application.entity';
import { Request } from '@modules/requests/domain/entities/request.entity';

describe('DecideApplicationUseCase', () => {
  const application = new Application({
    id: 1,
    demandeId: 10,
    aidantId: 'aidant-1',
    statusCode: 'PENDING',
    message: 'Dispo',
    prixPropose: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const request = new Request({
    id: 10,
    demandeurId: 'demandeur-1',
    statusCode: 'PUBLISHED',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const applicationRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    countAccepted: jest.fn(),
    refuseRemainingPending: jest.fn(),
    findAcceptedByDemandeId: jest.fn(),
  };

  const requestRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const missionRepository = {
    createWithParticipants: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(new Date('2026-09-02T10:00:00.000Z')),
  };

  const useCase = new DecideApplicationUseCase(
    applicationRepository as never,
    requestRepository as never,
    missionRepository as never,
    clock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    applicationRepository.findById.mockResolvedValue(application);
    requestRepository.findById.mockResolvedValue(request);
    applicationRepository.save.mockImplementation(async (app: Application) => app);
    requestRepository.save.mockImplementation(async (req: Request) => req);
  });

  it('refuses a pending application', async () => {
    applicationRepository.findById
      .mockResolvedValueOnce(application)
      .mockResolvedValueOnce(application.withStatus('REFUSED', clock.now()));

    const result = await useCase.execute({
      applicationId: 1,
      demandeurId: 'demandeur-1',
      decision: 'REFUSED',
    });

    expect(result.status).toBe('REFUSED');
    expect(missionRepository.createWithParticipants).not.toHaveBeenCalled();
  });

  it('accepts and creates mission when quota reached', async () => {
    const accepted = application.withStatus('ACCEPTED', clock.now());
    applicationRepository.findById
      .mockResolvedValueOnce(application)
      .mockResolvedValueOnce(accepted);
    applicationRepository.countAccepted.mockResolvedValue(1);
    applicationRepository.findAcceptedByDemandeId.mockResolvedValue([accepted]);
    missionRepository.createWithParticipants.mockResolvedValue({
      mission: {
        id: 5,
        statusCode: 'AWAITING_PAYMENT',
        montantTotal: 25,
      },
      participations: [],
    });
    requestRepository.findById
      .mockResolvedValueOnce(request)
      .mockResolvedValueOnce(request.withStatus('ASSIGNED', clock.now()));

    const result = await useCase.execute({
      applicationId: 1,
      demandeurId: 'demandeur-1',
      decision: 'ACCEPTED',
    });

    expect(applicationRepository.refuseRemainingPending).toHaveBeenCalled();
    expect(missionRepository.createWithParticipants).toHaveBeenCalled();
    expect(result.mission).toEqual({
      id: 5,
      status: 'AWAITING_PAYMENT',
      montantTotal: 25,
    });
  });

  it('forbids non-owner demandeur', async () => {
    await expect(
      useCase.execute({
        applicationId: 1,
        demandeurId: 'other-demandeur',
        decision: 'ACCEPTED',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects decision on non-pending application', async () => {
    applicationRepository.findById.mockResolvedValue(
      application.withStatus('ACCEPTED', clock.now()),
    );

    await expect(
      useCase.execute({
        applicationId: 1,
        demandeurId: 'demandeur-1',
        decision: 'REFUSED',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
