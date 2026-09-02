export interface PublishRequestCommand {
  demandeurId: string;
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

export interface RequestResult {
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

export interface ListPublishedRequestsQuery {
  aidantId?: string;
  page?: number;
  pageSize?: number;
}

export interface PublishedRequestResult extends RequestResult {
  myApplicationStatus: string | null;
}

export interface ListMyRequestsQuery {
  demandeurId: string;
  page?: number;
  pageSize?: number;
}

export interface RequestWithStatsResult extends RequestResult {
  pendingApplications: number;
  acceptedApplications: number;
  mission: { id: number; status: string; montantTotal: number } | null;
}
