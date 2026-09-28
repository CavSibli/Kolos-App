import type { ReportMotifCode } from '../../domain/entities/report.entity';

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
