import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MissionMessagingAccessService } from './mission-messaging-access.service';
import { Mission } from '@modules/missions/domain/entities/mission.entity';
import { Request } from '@modules/requests/domain/entities/request.entity';

describe('MissionMessagingAccessService', () => {
  const now = new Date('2026-09-28T16:00:00.000Z');

  const confirmedMission = new Mission({
    id: 5,
    demandeId: 10,
    statusCode: 'CONFIRMED',
    montantTotal: 25,
    dateDebut: null,
    dateFin: null,
    createdAt: now,
    updatedAt: now,
  });

  const awaitingMission = confirmedMission.withStatus('AWAITING_PAYMENT', now);

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
    findParticipationByMissionAndAidant: jest.fn(),
    findParticipationsByMissionId: jest.fn(),
  };

  const requestRepository = {
    findById: jest.fn(),
  };

  const service = new MissionMessagingAccessService(
    missionRepository as never,
    requestRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    missionRepository.findById.mockResolvedValue(confirmedMission);
    requestRepository.findById.mockResolvedValue(request);
    missionRepository.findParticipationByMissionAndAidant.mockResolvedValue(
      null,
    );
    missionRepository.findParticipationsByMissionId.mockResolvedValue([
      { aidantId: 'aidant-1' },
    ]);
  });

  it('allows demandeur participant on confirmed mission', async () => {
    const result = await service.assertParticipant(5, 'demandeur-1');
    expect(result.mission.id).toBe(5);
    expect(result.request.demandeurId).toBe('demandeur-1');
  });

  it('allows aidant participant on confirmed mission', async () => {
    missionRepository.findParticipationByMissionAndAidant.mockResolvedValue({
      aidantId: 'aidant-1',
    });

    const result = await service.assertParticipant(5, 'aidant-1');
    expect(result.mission.statusCode).toBe('CONFIRMED');
  });

  it('allows admin bypass without participation', async () => {
    const result = await service.assertParticipant(5, 'admin-1', {
      asAdmin: true,
    });
    expect(result.mission.id).toBe(5);
    expect(
      missionRepository.findParticipationByMissionAndAidant,
    ).not.toHaveBeenCalled();
  });

  it('forbids non-participant', async () => {
    await expect(
      service.assertParticipant(5, 'stranger'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects when mission is not confirmed', async () => {
    missionRepository.findById.mockResolvedValue(awaitingMission);

    await expect(
      service.assertParticipant(5, 'demandeur-1'),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('rejects unknown mission', async () => {
    missionRepository.findById.mockResolvedValue(null);

    await expect(
      service.assertParticipant(99, 'demandeur-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('resolves participant ids from demandeur + aidants', async () => {
    const ids = await service.resolveParticipantIds(5);
    expect(ids).toEqual(['demandeur-1', 'aidant-1']);
  });
});
