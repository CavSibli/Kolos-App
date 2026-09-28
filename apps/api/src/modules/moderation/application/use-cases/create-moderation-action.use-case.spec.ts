import { BadRequestException } from '@nestjs/common';
import { CreateModerationActionUseCase } from './create-moderation-action.use-case';

describe('CreateModerationActionUseCase', () => {
  const now = new Date('2026-09-28T18:00:00.000Z');

  const moderationActionRepository = {
    insert: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(now),
  };

  const useCase = new CreateModerationActionUseCase(
    moderationActionRepository as never,
    clock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    clock.now.mockReturnValue(now);
  });

  it('creates a moderation action (CLASSIFY)', async () => {
    moderationActionRepository.insert.mockResolvedValue({
      id: 'mod-1',
      reportId: 7,
      adminId: 'admin-1',
      action: 'CLASSIFY',
      reason: 'Signalement fondé',
      payload: { previousStatus: 'OPEN', nextStatus: 'RESOLVED' },
      createdAt: now,
    });

    const result = await useCase.execute({
      reportId: 7,
      adminId: 'admin-1',
      action: 'classify',
      reason: 'Signalement fondé',
      payload: { previousStatus: 'OPEN', nextStatus: 'RESOLVED' },
    });

    expect(moderationActionRepository.insert).toHaveBeenCalledWith({
      reportId: 7,
      adminId: 'admin-1',
      action: 'CLASSIFY',
      reason: 'Signalement fondé',
      payload: { previousStatus: 'OPEN', nextStatus: 'RESOLVED' },
      createdAt: now,
    });
    expect(result).toEqual({
      id: 'mod-1',
      reportId: 7,
      adminId: 'admin-1',
      action: 'CLASSIFY',
      reason: 'Signalement fondé',
      payload: { previousStatus: 'OPEN', nextStatus: 'RESOLVED' },
      createdAt: now.toISOString(),
    });
  });

  it('rejects invalid reportId', async () => {
    await expect(
      useCase.execute({
        reportId: 0,
        adminId: 'admin-1',
        action: 'MASK',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects empty adminId', async () => {
    await expect(
      useCase.execute({
        reportId: 1,
        adminId: '  ',
        action: 'MASK',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unknown action', async () => {
    await expect(
      useCase.execute({
        reportId: 1,
        adminId: 'admin-1',
        action: 'DELETE_EVERYTHING',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
