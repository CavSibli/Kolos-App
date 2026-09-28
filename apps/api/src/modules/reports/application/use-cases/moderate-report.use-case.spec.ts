import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ModerateReportUseCase } from './moderate-report.use-case';
import { Report } from '../../domain/entities/report.entity';
import { CreateModerationActionUseCase } from '@modules/moderation/application/use-cases/create-moderation-action.use-case';

describe('ModerateReportUseCase', () => {
  const now = new Date('2026-09-28T20:00:00.000Z');

  const openReport = new Report({
    id: 9,
    missionId: 42,
    auteurId: 'demandeur-1',
    utilisateurSignaleId: null,
    motifCode: 'NO_SHOW',
    statusCode: 'OPEN',
    priorityCode: 'NORMAL',
    description: 'Absent',
    createdAt: now,
    updatedAt: now,
  });

  const reportRepository = {
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  const createModerationActionUseCase = {
    execute: jest.fn(),
  };

  const clock = {
    now: jest.fn().mockReturnValue(now),
  };

  const useCase = new ModerateReportUseCase(
    reportRepository as never,
    createModerationActionUseCase as unknown as CreateModerationActionUseCase,
    clock as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    clock.now.mockReturnValue(now);
    reportRepository.findById.mockResolvedValue(openReport);
    createModerationActionUseCase.execute.mockResolvedValue({
      id: 'mod-1',
      reportId: 9,
      adminId: 'admin-1',
      action: 'CLASSIFY',
      reason: 'Fondé',
      payload: {
        previousStatus: 'OPEN',
        nextStatus: 'RESOLVED',
        source: 'admin',
      },
      createdAt: now.toISOString(),
    });
    reportRepository.updateStatus.mockResolvedValue(
      new Report({
        id: 9,
        missionId: 42,
        auteurId: 'demandeur-1',
        utilisateurSignaleId: null,
        motifCode: 'NO_SHOW',
        statusCode: 'RESOLVED',
        priorityCode: 'NORMAL',
        description: 'Absent',
        createdAt: now,
        updatedAt: now,
      }),
    );
  });

  it('writes Mongo moderation action and updates PG status (CLASSIFY → RESOLVED)', async () => {
    const result = await useCase.execute({
      reportId: 9,
      adminId: 'admin-1',
      action: 'classify',
      reason: 'Fondé',
    });

    expect(createModerationActionUseCase.execute).toHaveBeenCalledWith({
      reportId: 9,
      adminId: 'admin-1',
      action: 'CLASSIFY',
      reason: 'Fondé',
      payload: {
        previousStatus: 'OPEN',
        nextStatus: 'RESOLVED',
        source: 'admin',
      },
    });
    expect(reportRepository.updateStatus).toHaveBeenCalledWith(
      9,
      'RESOLVED',
      now,
    );
    expect(result.reportStatus).toBe('RESOLVED');
    expect(result.action).toBe('CLASSIFY');
  });

  it('maps DISMISS → REJECTED', async () => {
    createModerationActionUseCase.execute.mockResolvedValue({
      id: 'mod-2',
      reportId: 9,
      adminId: 'admin-1',
      action: 'DISMISS',
      reason: null,
      payload: {
        previousStatus: 'OPEN',
        nextStatus: 'REJECTED',
        source: 'admin',
      },
      createdAt: now.toISOString(),
    });
    reportRepository.updateStatus.mockResolvedValue(
      new Report({
        id: 9,
        missionId: 42,
        auteurId: 'demandeur-1',
        utilisateurSignaleId: null,
        motifCode: 'NO_SHOW',
        statusCode: 'REJECTED',
        priorityCode: 'NORMAL',
        description: 'Absent',
        createdAt: now,
        updatedAt: now,
      }),
    );

    const result = await useCase.execute({
      reportId: 9,
      adminId: 'admin-1',
      action: 'DISMISS',
    });

    expect(reportRepository.updateStatus).toHaveBeenCalledWith(
      9,
      'REJECTED',
      now,
    );
    expect(result.reportStatus).toBe('REJECTED');
  });

  it('rejects unknown action', async () => {
    await expect(
      useCase.execute({
        reportId: 9,
        adminId: 'admin-1',
        action: 'DELETE',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects missing report', async () => {
    reportRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        reportId: 404,
        adminId: 'admin-1',
        action: 'MASK',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
