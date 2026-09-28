export interface AdminStatsResult {
  usersTotal: number;
  requestsTotal: number;
  requestsByStatus: Record<string, number>;
  missionsTotal: number;
  reportsOpen: number;
  reportsTotal: number;
  messagesTotal: number;
}
