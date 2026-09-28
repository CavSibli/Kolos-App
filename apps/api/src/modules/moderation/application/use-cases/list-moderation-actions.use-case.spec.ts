import { ListModerationActionsUseCase } from './list-moderation-actions.use-case';

describe('ListModerationActionsUseCase', () => {
  const now = new Date('2026-09-28T18:05:00.000Z');

  const moderationActionRepository = {
    listByReportId: jest.fn(),
    listRecent: jest.fn(),
  };

  const useCase = new ListModerationActionsUseCase(
    moderationActionRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists actions for a given reportId', async () => {
    moderationActionRepository.listByReportId.mockResolvedValue([
      {
        id: 'mod-1',
        reportId: 7,
        adminId: 'admin-1',
        action: 'DISMISS',
        reason: 'Hors périmètre',
        payload: null,
        createdAt: now,
      },
    ]);

    const result = await useCase.execute({ reportId: 7 });

    expect(moderationActionRepository.listByReportId).toHaveBeenCalledWith(7);
    expect(moderationActionRepository.listRecent).not.toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 'mod-1',
        reportId: 7,
        adminId: 'admin-1',
        action: 'DISMISS',
        reason: 'Hors périmètre',
        payload: null,
        createdAt: now.toISOString(),
      },
    ]);
  });

  it('lists recent actions when no reportId', async () => {
    moderationActionRepository.listRecent.mockResolvedValue([
      {
        id: 'mod-2',
        reportId: 3,
        adminId: 'admin-1',
        action: 'MASK',
        reason: null,
        payload: { target: 'public_feed' },
        createdAt: now,
      },
    ]);

    const result = await useCase.execute({ limit: 10 });

    expect(moderationActionRepository.listRecent).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('MASK');
  });
});
