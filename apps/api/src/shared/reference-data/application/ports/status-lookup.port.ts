export type VerificationStatusCode =
  | 'NOT_VERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export type DemandeStatusCode =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'PARTIALLY_ASSIGNED'
  | 'ASSIGNED'
  | 'CANCELLED'
  | 'EXPIRED';

export type CandidatureStatusCode =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REFUSED'
  | 'WITHDRAWN';

export type MissionStatusCode =
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'AWAITING_CONFIRMATION'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';

export type ParticipationStatusCode = 'SELECTED' | 'COMPLETED' | 'CANCELLED';

export interface StatusLookupPort {
  getVerificationStatusId(code: VerificationStatusCode): Promise<number>;
  getDemandeStatusId(code: DemandeStatusCode): Promise<number>;
  getCandidatureStatusId(code: CandidatureStatusCode): Promise<number>;
  getMissionStatusId(code: MissionStatusCode): Promise<number>;
  getParticipationStatusId(code: ParticipationStatusCode): Promise<number>;
  getDemandeStatusCode(id: number): Promise<DemandeStatusCode>;
  getCandidatureStatusCode(id: number): Promise<CandidatureStatusCode>;
  getMissionStatusCode(id: number): Promise<MissionStatusCode>;
  getParticipationStatusCode(id: number): Promise<ParticipationStatusCode>;
}
