import { RequestResult } from '@modules/requests/application/dto/request.commands';

export interface ApplicationWithContextResult {
  id: number;
  status: string;
  message: string | null;
  prixPropose: number | null;
  createdAt: string;
  request: RequestResult;
  mission: { id: number; status: string; montantTotal: number } | null;
  participation: {
    id: number;
    status: string;
    montantConvenu: number;
  } | null;
}

export interface ListMyApplicationsQuery {
  aidantId: string;
  page?: number;
  pageSize?: number;
}

export interface DecideApplicationCommand {
  applicationId: number;
  demandeurId: string;
  decision: 'ACCEPTED' | 'REFUSED';
}

export interface DecideApplicationResult {
  applicationId: number;
  status: string;
  requestStatus: string;
  mission: { id: number; status: string; montantTotal: number } | null;
}

export interface ListRequestApplicationsQuery {
  demandeurId: string;
  demandeId: number;
}

export interface CandidateResult {
  applicationId: number;
  status: string;
  message: string | null;
  prixPropose: number | null;
  createdAt: string;
  aidant: {
    userId: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    rayonIntervention: number | null;
  };
}
