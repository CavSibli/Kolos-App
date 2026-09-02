import { ApiClient, type ApiClientOptions } from './api-client';
import type {
  AidantProfileResponse,
  ApplicationResponse,
  ApplyToRequestBody,
  PaginatedRequestsResponse,
  PublishRequestBody,
  RequestResponse,
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
  ): Promise<PaginatedRequestsResponse> {
    const params = new URLSearchParams({
      status: 'PUBLISHED',
      page: String(page),
      pageSize: String(pageSize),
    });
    return this.api.get<PaginatedRequestsResponse>(`/requests?${params}`);
  }

  applyToRequest(body: ApplyToRequestBody): Promise<ApplicationResponse> {
    return this.api.post<ApplicationResponse>('/applications', body);
  }
}
