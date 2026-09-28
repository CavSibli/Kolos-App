export interface ModerationActionRecord {
  id: string;
  reportId: number;
  adminId: string;
  action: string;
  reason: string | null;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ModerationActionRepository {
  insert(input: {
    reportId: number;
    adminId: string;
    action: string;
    reason: string | null;
    payload: Record<string, unknown> | null;
    createdAt: Date;
  }): Promise<ModerationActionRecord>;

  listByReportId(reportId: number): Promise<ModerationActionRecord[]>;

  listRecent(limit?: number): Promise<ModerationActionRecord[]>;
}
