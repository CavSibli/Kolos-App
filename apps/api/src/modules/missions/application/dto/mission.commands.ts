import type { MissionStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export interface AuthorizePaymentCommand {
  missionId: number;
  demandeurId: string;
}

export interface AuthorizePaymentResult {
  missionId: number;
  status: MissionStatusCode;
  montantTotal: number;
}
