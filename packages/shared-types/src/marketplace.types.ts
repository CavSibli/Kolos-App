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

export type ReportMotifCode =
  | 'NO_SHOW'
  | 'DELAY'
  | 'NOT_PERFORMED'
  | 'BEHAVIOUR'
  | 'PAYMENT'
  | 'OTHER';

export interface CreateReportBody {
  motif: ReportMotifCode;
  description: string;
}

export interface CreateReportResponse {
  id: number;
  missionId: number;
  motif: ReportMotifCode;
  status: string;
  description: string;
  createdAt: string;
}

export type ReportStatusCode = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export type ReportPriorityCode = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface AdminReportListItem {
  id: number;
  missionId: number;
  auteurId: string;
  motif: ReportMotifCode;
  status: ReportStatusCode;
  priority: ReportPriorityCode;
  description: string;
  createdAt: string;
}

export interface PaginatedAdminReportsResponse {
  items: AdminReportListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type ModerationActionCode = 'MASK' | 'CLASSIFY' | 'DISMISS';

export interface CreateAdminReportActionBody {
  action: ModerationActionCode;
  reason?: string;
}

export interface ModeratedReportActionResponse {
  id: string;
  reportId: number;
  adminId: string;
  action: string;
  reason: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
  reportStatus: ReportStatusCode;
}

export interface AdminStatsResponse {
  usersTotal: number;
  requestsTotal: number;
  requestsByStatus: Record<string, number>;
  missionsTotal: number;
  reportsOpen: number;
  reportsTotal: number;
  messagesTotal: number;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<'demandeur' | 'aidant' | 'admin'>;
  createdAt: string;
  banned: boolean;
  bannedAt: string | null;
  banUntil: string | null;
  banReason: string | null;
}

export interface PaginatedAdminUsersResponse {
  items: AdminUserResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAdminUserBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'demandeur' | 'aidant';
}

export interface UpdateAdminUserBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: Array<'demandeur' | 'aidant' | 'admin'>;
}

export interface BanAdminUserBody {
  until?: string | null;
  reason?: string;
}

export interface MissionMessageResponse {
  id: string;
  conversationId: string;
  missionId: number;
  userId: string;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorDisplayName: string;
  body: string;
  createdAt: string;
}

export interface PostMissionMessageBody {
  body: string;
}

export interface ApplyToRequestBody {
  demandeId: number;
  message?: string;
  prixPropose?: number;
}
