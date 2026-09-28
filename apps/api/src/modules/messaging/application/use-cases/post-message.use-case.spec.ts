import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PostMessageUseCase } from './post-message.use-case';
import { Mission } from '@modules/missions/domain/entities/mission.entity';
import { Request } from '@modules/requests/domain/entities/request.entity';
import { MissionMessagingAccessService } from '../services/mission-messaging-access.service';

describe('PostMessageUseCase', () => {
  const now = new Date('2026-09-28T15:05:00.000Z');

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
    resolveParticipantIds: jest.fn(),
  };

  const conversationRepository = {
    getOrCreate: jest.fn(),
  };

  const messageRepository = {
    insert: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(now),
  };

  const useCase = new PostMessageUseCase(
    access as unknown as MissionMessagingAccessService,
    conversationRepository as never,
    messageRepository as never,
    clock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    access.assertParticipant.mockResolvedValue({ mission, request });
    access.resolveParticipantIds.mockResolvedValue([
      'demandeur-1',
      'aidant-1',
    ]);
    conversationRepository.getOrCreate.mockResolvedValue({
      id: 'conv-1',
      missionId: 5,
      participantIds: ['demandeur-1', 'aidant-1'],
      createdAt: now,
    });
    messageRepository.insert.mockImplementation(async (input) => ({
      id: 'msg-2',
      ...input,
    }));
  });

  it('posts a message and creates conversation if needed', async () => {
    const result = await useCase.execute({
      missionId: 5,
      userId: 'demandeur-1',
      body: 'Merci pour votre aide',
    });

    expect(conversationRepository.getOrCreate).toHaveBeenCalledWith(5, [
      'demandeur-1',
      'aidant-1',
    ]);
    expect(messageRepository.insert).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      missionId: 5,
      userId: 'demandeur-1',
      body: 'Merci pour votre aide',
      createdAt: now,
    });
    expect(result).toEqual({
      id: 'msg-2',
      conversationId: 'conv-1',
      missionId: 5,
      userId: 'demandeur-1',
      body: 'Merci pour votre aide',
      createdAt: now.toISOString(),
    });
  });

  it('rejects empty body', async () => {
    await expect(
      useCase.execute({
        missionId: 5,
        userId: 'demandeur-1',
        body: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('forbids non-participant', async () => {
    access.assertParticipant.mockRejectedValue(
      new ForbiddenException('Seuls les participants'),
    );

    await expect(
      useCase.execute({
        missionId: 5,
        userId: 'stranger',
        body: 'Hello',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
