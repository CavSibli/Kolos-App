import {
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ListMessagesUseCase } from './list-messages.use-case';
import { Mission } from '@modules/missions/domain/entities/mission.entity';
import { Request } from '@modules/requests/domain/entities/request.entity';
import { MissionMessagingAccessService } from '../services/mission-messaging-access.service';

describe('ListMessagesUseCase', () => {
  const now = new Date('2026-09-28T15:00:00.000Z');

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

  const access = {
    assertParticipant: jest.fn(),
  };

  const conversationRepository = {
    findByMissionId: jest.fn(),
  };

  const messageRepository = {
    listByConversationId: jest.fn(),
  };

  const useCase = new ListMessagesUseCase(
    access as unknown as MissionMessagingAccessService,
    conversationRepository as never,
    messageRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    access.assertParticipant.mockResolvedValue({ mission, request });
  });

  it('returns empty list when no conversation exists', async () => {
    conversationRepository.findByMissionId.mockResolvedValue(null);

    const result = await useCase.execute({
      missionId: 5,
      userId: 'demandeur-1',
    });

    expect(result).toEqual([]);
    expect(messageRepository.listByConversationId).not.toHaveBeenCalled();
  });

  it('lists messages for an existing conversation', async () => {
    conversationRepository.findByMissionId.mockResolvedValue({
      id: 'conv-1',
      missionId: 5,
      participantIds: ['demandeur-1', 'aidant-1'],
      createdAt: now,
    });
    messageRepository.listByConversationId.mockResolvedValue([
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        missionId: 5,
        userId: 'aidant-1',
        body: 'Bonjour',
        createdAt: now,
      },
    ]);

    const result = await useCase.execute({
      missionId: 5,
      userId: 'demandeur-1',
    });

    expect(result).toEqual([
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        missionId: 5,
        userId: 'aidant-1',
        body: 'Bonjour',
        createdAt: now.toISOString(),
      },
    ]);
  });

  it('propagates forbidden when not participant', async () => {
    access.assertParticipant.mockRejectedValue(
      new ForbiddenException('Seuls les participants'),
    );

    await expect(
      useCase.execute({ missionId: 5, userId: 'stranger' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('propagates 422 when mission not confirmed', async () => {
    access.assertParticipant.mockRejectedValue(
      new UnprocessableEntityException('après confirmation'),
    );

    await expect(
      useCase.execute({ missionId: 5, userId: 'demandeur-1' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
