import { BadRequestException } from '@nestjs/common';
import { PublishRequestUseCase } from './publish-request.use-case';
import { Request } from '../../domain/entities/request.entity';

describe('PublishRequestUseCase', () => {
  const requestRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findPublished: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(new Date('2026-09-01T10:00:00.000Z')),
  };

  const useCase = new PublishRequestUseCase(
    requestRepository as never,
    clock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes a valid request', async () => {
    requestRepository.save.mockImplementation(async (request: Request) =>
      new Request({
        id: 1,
        demandeurId: request.demandeurId,
        statusCode: request.statusCode,
        titre: request.titre,
        description: request.description,
        contraintesPhysiques: request.contraintesPhysiques,
        adresse: request.adresse,
        latitude: request.latitude,
        longitude: request.longitude,
        dateMission: request.dateMission,
        dureeEstimee: request.dureeEstimee,
        nbAidantsRequis: request.nbAidantsRequis,
        budgetEstime: request.budgetEstime,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      }),
    );

    const result = await useCase.execute({
      demandeurId: 'user-1',
      titre: 'Aide courses',
      description: 'Besoin d aide pour les courses',
      adresse: '10 rue de Paris',
      dateMission: '2026-09-10T14:00:00.000Z',
      dureeEstimee: 60,
      nbAidantsRequis: 1,
    });

    expect(requestRepository.save).toHaveBeenCalled();
    expect(result.status).toBe('PUBLISHED');
    expect(result.titre).toBe('Aide courses');
  });

  it('rejects a mission date in the past', async () => {
    await expect(
      useCase.execute({
        demandeurId: 'user-1',
        titre: 'Aide courses',
        description: 'Description',
        adresse: '10 rue de Paris',
        dateMission: '2026-08-01T14:00:00.000Z',
        dureeEstimee: 60,
        nbAidantsRequis: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
