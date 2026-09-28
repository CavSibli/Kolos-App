import { Report } from '../entities/report.entity';

export interface ReportListResult {
  items: Report[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportRepository {
  save(report: Report): Promise<Report>;
  listForAdmin(options: {
    page: number;
    pageSize: number;
  }): Promise<ReportListResult>;
}
