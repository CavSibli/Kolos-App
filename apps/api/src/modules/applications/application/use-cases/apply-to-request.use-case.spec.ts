import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApplyToRequestUseCase } from './apply-to-request.use-case';
import { Request } from '@modules/requests/domain/entities/request.entity';
import { Application } from '../../domain/entities/application.entity';

describe('ApplyToRequestUseCase', () => {
  const applicationRepository = {
    save: jest.fn(),
    existsByDemandeAndAidant: jest.fn(),
  };

  const requestRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    findPublished: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(new Date('2026-09-01T10:00:00.000Z')),
  };

  const publishedRequest = new Request({
    id: 1,
    demandeurId: 'demandeur-1',
    statusCode: 'PUBLISHED',
    titre: 'Aide',
    description: 'Description',
    contraintesPhysiques: null,
    adresse: 'Paris',
    latitude: null,
    longitude: null,
    dateMission: new Date('2026-09-10T14:00:00.000Z'),
    dureeEstimee: 60,
    nbAidantsRequis: 1,
    budgetEstime: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const useCase = new ApplyToRequestUseCase(
    applicationRepository as never,
    requestRepository as never,
    clock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    requestRepository.findById.mockResolvedValue(publishedRequest);
    applicationRepository.existsByDemandeAndAidant.mockResolvedValue(false);
    applicationRepository.save.mockImplementation(
      async (application: Application) =>
        new Application({
          id: 10,
          demandeId: application.demandeId,
          aidantId: application.aidantId,
          statusCode: application.statusCode,
          message: application.message,
          prixPropose: application.prixPropose,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
        }),
    );
  });

  it('creates a pending application', async () => {
    const result = await useCase.execute({
      aidantId: 'aidant-1',
      demandeId: 1,
      message: 'Je suis disponible',
      prixPropose: 25,
    });

    expect(result.status).toBe('PENDING');
    expect(applicationRepository.save).toHaveBeenCalled();
  });

  it('throws when request is missing', async () => {
    requestRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ aidantId: 'aidant-1', demandeId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when aidant applies to own request', async () => {
    await expect(
      useCase.execute({ aidantId: 'demandeur-1', demandeId: 1 }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('throws on duplicate application', async () => {
    applicationRepository.existsByDemandeAndAidant.mockResolvedValue(true);

    await expect(
      useCase.execute({ aidantId: 'aidant-1', demandeId: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
