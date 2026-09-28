import { Report } from '../entities/report.entity';
import type { ReportStatusCode } from '../entities/report.entity';

export interface ReportListResult {
  items: Report[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportRepository {
  save(report: Report): Promise<Report>;
  findById(id: number): Promise<Report | null>;
  updateStatus(
    id: number,
    statusCode: ReportStatusCode,
    updatedAt: Date,
  ): Promise<Report>;
  listForAdmin(options: {
    page: number;
    pageSize: number;
  }): Promise<ReportListResult>;
}
