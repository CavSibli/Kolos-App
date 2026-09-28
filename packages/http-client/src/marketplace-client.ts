import { ApiClient, type ApiClientOptions } from './api-client';
import type {
  AidantProfileResponse,
  ApplicationResponse,
  ApplicationWithContextResponse,
  ApplyToRequestBody,
  AuthorizePaymentResponse,
  CandidateResponse,
  CreateReportBody,
  CreateReportResponse,
  CreateAdminReportActionBody,
  DecideApplicationBody,
  DecideApplicationResponse,
  MissionMessageResponse,
  ModeratedReportActionResponse,
  AdminStatsResponse,
  AdminUserResponse,
  BanAdminUserBody,
  CreateAdminUserBody,
  CreateAdminRequestBody,
  UpdateAdminRequestBody,
  UpdateAdminUserBody,
  PaginatedAdminReportsResponse,
  PaginatedAdminUsersResponse,
  PaginatedAdminRequestsResponse,
  PaginatedApplicationsWithContextResponse,
  PaginatedPublishedRequestsResponse,
  PaginatedRequestsWithStatsResponse,
  PostMissionMessageBody,
  PublishRequestBody,
  RequestResponse,
  RequestWithStatsResponse,
  UpsertAidantProfileRequest,
} from '@kolos/shared-types';

export class MarketplaceClient {
  private readonly api: ApiClient;

  constructor(options: ApiClientOptions) {
    this.api = new ApiClient(options);
  }

  upsertAidantProfile(
    body: UpsertAidantProfileRequest,
  ): Promise<AidantProfileResponse> {
    return this.api.patch<AidantProfileResponse>('/me/aidant-profile', body);
  }

  publishRequest(body: PublishRequestBody): Promise<RequestResponse> {
    return this.api.post<RequestResponse>('/requests', body);
  }

  listPublishedRequests(
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedPublishedRequestsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    return this.api.get<PaginatedPublishedRequestsResponse>(`/requests?${params}`);
  }

  listMyRequests(
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedRequestsWithStatsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    return this.api.get<PaginatedRequestsWithStatsResponse>(
      `/requests/mine?${params}`,
    );
  }

  getRequestDetail(id: number): Promise<RequestWithStatsResponse> {
    return this.api.get<RequestWithStatsResponse>(`/requests/${id}`);
  }

  listRequestCandidates(requestId: number): Promise<CandidateResponse[]> {
    return this.api.get<CandidateResponse[]>(`/requests/${requestId}/applications`);
  }

  applyToRequest(body: ApplyToRequestBody): Promise<ApplicationResponse> {
    return this.api.post<ApplicationResponse>('/applications', body);
  }

  listMyApplications(
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedApplicationsWithContextResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    return this.api.get<PaginatedApplicationsWithContextResponse>(
      `/applications/me?${params}`,
    );
  }

  getMyApplication(id: number): Promise<ApplicationWithContextResponse> {
    return this.api.get<ApplicationWithContextResponse>(`/applications/me/${id}`);
  }

  decideApplication(
    applicationId: number,
    body: DecideApplicationBody,
  ): Promise<DecideApplicationResponse> {
    return this.api.post<DecideApplicationResponse>(
      `/applications/${applicationId}/decision`,
      body,
    );
  }

  authorizePayment(missionId: number): Promise<AuthorizePaymentResponse> {
    return this.api.post<AuthorizePaymentResponse>(
      `/missions/${missionId}/payments/mock-authorize`,
    );
  }

  createReport(
    missionId: number,
    body: CreateReportBody,
  ): Promise<CreateReportResponse> {
    return this.api.post<CreateReportResponse>(
      `/missions/${missionId}/reports`,
      body,
    );
  }

  listAdminReports(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedAdminReportsResponse> {
    const search = new URLSearchParams();
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.pageSize != null) {
      search.set('pageSize', String(params.pageSize));
    }
    const query = search.toString();
    return this.api.get<PaginatedAdminReportsResponse>(
      `/admin/reports${query ? `?${query}` : ''}`,
    );
  }

  postAdminReportAction(
    reportId: number,
    body: CreateAdminReportActionBody,
  ): Promise<ModeratedReportActionResponse> {
    return this.api.post<ModeratedReportActionResponse>(
      `/admin/reports/${reportId}/actions`,
      body,
    );
  }

  getAdminStats(): Promise<AdminStatsResponse> {
    return this.api.get<AdminStatsResponse>('/admin/stats');
  }

  listAdminUsers(params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    role?: string;
    banned?: boolean;
  }): Promise<PaginatedAdminUsersResponse> {
    const search = new URLSearchParams();
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.pageSize != null) {
      search.set('pageSize', String(params.pageSize));
    }
    if (params?.q) search.set('q', params.q);
    if (params?.role) search.set('role', params.role);
    if (params?.banned != null) search.set('banned', String(params.banned));
    const query = search.toString();
    return this.api.get<PaginatedAdminUsersResponse>(
      `/admin/users${query ? `?${query}` : ''}`,
    );
  }

  createAdminUser(body: CreateAdminUserBody): Promise<AdminUserResponse> {
    return this.api.post<AdminUserResponse>('/admin/users', body);
  }

  updateAdminUser(
    id: string,
    body: UpdateAdminUserBody,
  ): Promise<AdminUserResponse> {
    return this.api.patch<AdminUserResponse>(`/admin/users/${id}`, body);
  }

  banAdminUser(
    id: string,
    body: BanAdminUserBody,
  ): Promise<AdminUserResponse> {
    return this.api.post<AdminUserResponse>(`/admin/users/${id}/ban`, body);
  }

  unbanAdminUser(id: string): Promise<AdminUserResponse> {
    return this.api.post<AdminUserResponse>(`/admin/users/${id}/unban`);
  }

  listAdminRequests(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<PaginatedAdminRequestsResponse> {
    const search = new URLSearchParams();
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.pageSize != null) {
      search.set('pageSize', String(params.pageSize));
    }
    if (params?.status) search.set('status', params.status);
    const query = search.toString();
    return this.api.get<PaginatedAdminRequestsResponse>(
      `/admin/requests${query ? `?${query}` : ''}`,
    );
  }

  createAdminRequest(
    body: CreateAdminRequestBody,
  ): Promise<RequestResponse> {
    return this.api.post<RequestResponse>('/admin/requests', body);
  }

  updateAdminRequest(
    id: number,
    body: UpdateAdminRequestBody,
  ): Promise<RequestResponse> {
    return this.api.patch<RequestResponse>(`/admin/requests/${id}`, body);
  }

  cancelAdminRequest(id: number): Promise<{ id: number; status: string; titre: string }> {
    return this.api.post(`/admin/requests/${id}/cancel`);
  }

  listMissionMessages(missionId: number): Promise<MissionMessageResponse[]> {
    return this.api.get<MissionMessageResponse[]>(
      `/missions/${missionId}/messages`,
    );
  }

  postMissionMessage(
    missionId: number,
    body: PostMissionMessageBody,
  ): Promise<MissionMessageResponse> {
    return this.api.post<MissionMessageResponse>(
      `/missions/${missionId}/messages`,
      body,
    );
  }
}
