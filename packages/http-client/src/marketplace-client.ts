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
  DecideApplicationBody,
  DecideApplicationResponse,
  MissionMessageResponse,
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
