import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportUseCase } from './create-report.use-case';
import { Mission } from '@modules/missions/domain/entities/mission.entity';
import { Participation } from '@modules/missions/domain/entities/participation.entity';
import { Request } from '@modules/requests/domain/entities/request.entity';
import { Report } from '../../domain/entities/report.entity';

describe('CreateReportUseCase', () => {
  const now = new Date('2026-09-28T12:00:00.000Z');

  const mission = new Mission({
    id: 5,
    demandeId: 10,
    statusCode: 'CONFIRMED',
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

  const participation = new Participation({
    id: 1,
    missionId: 5,
    aidantId: 'aidant-1',
    candidatureId: 2,
    statusCode: 'SELECTED',
    montantConvenu: 25,
    createdAt: now,
    updatedAt: now,
  });

  const reportRepository = {
    save: jest.fn(),
  };

  const missionRepository = {
    findById: jest.fn(),
    findParticipationByMissionAndAidant: jest.fn(),
  };

  const requestRepository = {
    findById: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(now),
  };

  const useCase = new CreateReportUseCase(
    reportRepository as never,
    missionRepository as never,
    requestRepository as never,
    clock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    missionRepository.findById.mockResolvedValue(mission);
    requestRepository.findById.mockResolvedValue(request);
    missionRepository.findParticipationByMissionAndAidant.mockResolvedValue(
      null,
    );
    reportRepository.save.mockImplementation(async (report: Report) =>
      new Report({
        id: 99,
        missionId: report.missionId,
        auteurId: report.auteurId,
        utilisateurSignaleId: report.utilisateurSignaleId,
        motifCode: report.motifCode,
        statusCode: report.statusCode,
        priorityCode: report.priorityCode,
        description: report.description,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      }),
    );
  });

  it('creates a report for demandeur owner', async () => {
    const result = await useCase.execute({
      missionId: 5,
      authorId: 'demandeur-1',
      motif: 'NO_SHOW',
      description: 'Aidant absent',
    });

    expect(reportRepository.save).toHaveBeenCalled();
    expect(result).toEqual({
      id: 99,
      missionId: 5,
      motif: 'NO_SHOW',
      status: 'OPEN',
      description: 'Aidant absent',
      createdAt: now.toISOString(),
    });
  });

  it('creates a report for aidant participant', async () => {
    missionRepository.findParticipationByMissionAndAidant.mockResolvedValue(
      participation,
    );

    const result = await useCase.execute({
      missionId: 5,
      authorId: 'aidant-1',
      motif: 'PAYMENT',
      description: 'Problème de paiement',
    });

    expect(result.status).toBe('OPEN');
    expect(result.motif).toBe('PAYMENT');
  });

  it('forbids non-participant', async () => {
    await expect(
      useCase.execute({
        missionId: 5,
        authorId: 'stranger',
        motif: 'OTHER',
        description: 'Spam',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(reportRepository.save).not.toHaveBeenCalled();
  });

  it('rejects empty description', async () => {
    await expect(
      useCase.execute({
        missionId: 5,
        authorId: 'demandeur-1',
        motif: 'OTHER',
        description: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid motif', async () => {
    await expect(
      useCase.execute({
        missionId: 5,
        authorId: 'demandeur-1',
        motif: 'UNKNOWN' as never,
        description: 'Test',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when mission is missing', async () => {
    missionRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        missionId: 999,
        authorId: 'demandeur-1',
        motif: 'OTHER',
        description: 'Test',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
