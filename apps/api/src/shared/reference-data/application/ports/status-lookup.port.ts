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

export interface StatusLookupPort {
  getVerificationStatusId(code: VerificationStatusCode): Promise<number>;
  getDemandeStatusId(code: DemandeStatusCode): Promise<number>;
  getCandidatureStatusId(code: CandidatureStatusCode): Promise<number>;
  getDemandeStatusCode(id: number): Promise<DemandeStatusCode>;
  getCandidatureStatusCode(id: number): Promise<CandidatureStatusCode>;
}
