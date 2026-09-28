import { ListAdminReportsUseCase } from './list-admin-reports.use-case';
import { Report } from '../../domain/entities/report.entity';

describe('ListAdminReportsUseCase', () => {
  const now = new Date('2026-09-28T19:00:00.000Z');

  const reportRepository = {
    listForAdmin: jest.fn(),
  };

  const useCase = new ListAdminReportsUseCase(reportRepository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists reports for admin with default pagination', async () => {
    reportRepository.listForAdmin.mockResolvedValue({
      items: [
        new Report({
          id: 3,
          missionId: 12,
          auteurId: 'demandeur-1',
          utilisateurSignaleId: null,
          motifCode: 'NO_SHOW',
          statusCode: 'OPEN',
          priorityCode: 'NORMAL',
          description: 'Aidant absent',
          createdAt: now,
          updatedAt: now,
        }),
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    const result = await useCase.execute({});

    expect(reportRepository.listForAdmin).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });
    expect(result).toEqual({
      items: [
        {
          id: 3,
          missionId: 12,
          auteurId: 'demandeur-1',
          motif: 'NO_SHOW',
          status: 'OPEN',
          priority: 'NORMAL',
          description: 'Aidant absent',
          createdAt: now.toISOString(),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
  });

  it('forwards custom page and pageSize', async () => {
    reportRepository.listForAdmin.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      pageSize: 5,
    });

    const result = await useCase.execute({ page: 2, pageSize: 5 });

    expect(reportRepository.listForAdmin).toHaveBeenCalledWith({
      page: 2,
      pageSize: 5,
    });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
