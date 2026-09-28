export interface AidantProfileResponse {
  id: number;
  userId: string;
  bio: string | null;
  rayonIntervention: number;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAidantProfileRequest {
  bio?: string;
  rayonIntervention: number;
}

export interface RequestResponse {
  id: number;
  demandeurId: string;
  status: string;
  titre: string;
  description: string;
  contraintesPhysiques: string | null;
  adresse: string;
  latitude: number | null;
  longitude: number | null;
  dateMission: string;
  dureeEstimee: number;
  nbAidantsRequis: number;
  budgetEstime: number | null;
  createdAt: string;
}

export interface PublishedRequestResponse extends RequestResponse {
  myApplicationStatus: string | null;
}

export interface RequestWithStatsResponse extends RequestResponse {
  pendingApplications: number;
  acceptedApplications: number;
  mission: { id: number; status: string; montantTotal: number } | null;
}

export interface PublishRequestBody {
  titre: string;
  description: string;
  contraintesPhysiques?: string;
  adresse: string;
  latitude?: number;
  longitude?: number;
  dateMission: string;
  dureeEstimee: number;
  nbAidantsRequis: number;
  budgetEstime?: number;
}

export interface PaginatedRequestsResponse {
  items: RequestResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginatedPublishedRequestsResponse {
  items: PublishedRequestResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginatedRequestsWithStatsResponse {
  items: RequestWithStatsResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApplicationResponse {
  id: number;
  demandeId: number;
  aidantId: string;
  status: string;
  message: string | null;
  prixPropose: number | null;
  createdAt: string;
}

export interface ApplicationWithContextResponse {
  id: number;
  status: string;
  message: string | null;
  prixPropose: number | null;
  createdAt: string;
  request: RequestResponse;
  mission: { id: number; status: string; montantTotal: number } | null;
  participation: {
    id: number;
    status: string;
    montantConvenu: number;
  } | null;
}

export interface PaginatedApplicationsWithContextResponse {
  items: ApplicationWithContextResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CandidateResponse {
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

export interface DecideApplicationBody {
  decision: 'ACCEPTED' | 'REFUSED';
}

export interface DecideApplicationResponse {
  applicationId: number;
  status: string;
  requestStatus: string;
  mission: { id: number; status: string; montantTotal: number } | null;
}

export interface AuthorizePaymentResponse {
  missionId: number;
  status: string;
  montantTotal: number;
}

export interface ApplyToRequestBody {
  demandeId: number;
  message?: string;
  prixPropose?: number;
}
