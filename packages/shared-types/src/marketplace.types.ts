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

export interface ApplicationResponse {
  id: number;
  demandeId: number;
  aidantId: string;
  status: string;
  message: string | null;
  prixPropose: number | null;
  createdAt: string;
}

export interface ApplyToRequestBody {
  demandeId: number;
  message?: string;
  prixPropose?: number;
}
