import { GetAdminStatsUseCase } from './get-admin-stats.use-case';

describe('GetAdminStatsUseCase', () => {
  const users = { count: jest.fn() };
  const demandes = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const missions = { count: jest.fn() };
  const signalements = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const messages = {
    countDocuments: jest.fn(),
  };

  const useCase = new GetAdminStatsUseCase(
    users as never,
    demandes as never,
    missions as never,
    signalements as never,
    messages as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    users.count.mockResolvedValue(12);
    demandes.count.mockResolvedValue(8);
    missions.count.mockResolvedValue(5);
    signalements.count.mockResolvedValue(3);
    messages.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(40),
    });

    const statusQb = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { code: 'PUBLISHED', count: '4' },
        { code: 'CANCELLED', count: '2' },
      ]),
    };
    demandes.createQueryBuilder.mockReturnValue(statusQb);

    const openQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
    };
    signalements.createQueryBuilder.mockReturnValue(openQb);
  });

  it('aggregates postgres and mongo counters', async () => {
    const result = await useCase.execute();

    expect(result).toEqual({
      usersTotal: 12,
      requestsTotal: 8,
      requestsByStatus: { PUBLISHED: 4, CANCELLED: 2 },
      missionsTotal: 5,
      reportsOpen: 1,
      reportsTotal: 3,
      messagesTotal: 40,
    });
  });
});
