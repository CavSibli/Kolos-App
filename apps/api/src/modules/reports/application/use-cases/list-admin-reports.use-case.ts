import { Inject, Injectable } from '@nestjs/common';
import { ReportRepository } from '../../domain/repositories/report.repository';
import { REPORT_REPOSITORY } from '../../reports.tokens';
import {
  ListAdminReportsCommand,
  ListAdminReportsResult,
} from '../dto/report.commands';

@Injectable()
export class ListAdminReportsUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: ReportRepository,
  ) {}

  async execute(
    command: ListAdminReportsCommand = {},
  ): Promise<ListAdminReportsResult> {
    const page = command.page ?? 1;
    const pageSize = command.pageSize ?? 20;

    const result = await this.reportRepository.listForAdmin({ page, pageSize });

    return {
      items: result.items.map((report) => ({
        id: report.id!,
        missionId: report.missionId,
        auteurId: report.auteurId,
        motif: report.motifCode,
        status: report.statusCode,
        priority: report.priorityCode,
        description: report.description,
        createdAt: report.createdAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
