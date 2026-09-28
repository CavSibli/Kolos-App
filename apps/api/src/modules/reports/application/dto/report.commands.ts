import type {
  ReportMotifCode,
  ReportPriorityCode,
  ReportStatusCode,
} from '../../domain/entities/report.entity';

export interface CreateReportCommand {
  missionId: number;
  authorId: string;
  motif: ReportMotifCode;
  description: string;
}

export interface CreateReportResult {
  id: number;
  missionId: number;
  motif: ReportMotifCode;
  status: string;
  description: string;
  createdAt: string;
}

export interface ListAdminReportsCommand {
  page?: number;
  pageSize?: number;
}

export interface AdminReportListItemResult {
  id: number;
  missionId: number;
  auteurId: string;
  motif: ReportMotifCode;
  status: ReportStatusCode;
  priority: ReportPriorityCode;
  description: string;
  createdAt: string;
}

export interface ListAdminReportsResult {
  items: AdminReportListItemResult[];
  total: number;
  page: number;
  pageSize: number;
}
