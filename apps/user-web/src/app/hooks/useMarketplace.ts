import { useMemo } from 'react';
import { MarketplaceClient } from '@kolos/http-client';
import { useAuthInternals } from '../providers/AuthProvider';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/v1';

export function useMarketplace() {
  const { getAccessToken, refreshSession } = useAuthInternals();

  const client = useMemo(
    () =>
      new MarketplaceClient({
        baseUrl: API_BASE_URL,
        getAccessToken,
        onUnauthorized: refreshSession,
      }),
    [getAccessToken, refreshSession],
  );

  return useMemo(
    () => ({
      upsertAidantProfile: client.upsertAidantProfile.bind(client),
      publishRequest: client.publishRequest.bind(client),
      listPublishedRequests: client.listPublishedRequests.bind(client),
      listMyRequests: client.listMyRequests.bind(client),
      getRequestDetail: client.getRequestDetail.bind(client),
      listRequestCandidates: client.listRequestCandidates.bind(client),
      applyToRequest: client.applyToRequest.bind(client),
      listMyApplications: client.listMyApplications.bind(client),
      getMyApplication: client.getMyApplication.bind(client),
      decideApplication: client.decideApplication.bind(client),
      authorizePayment: client.authorizePayment.bind(client),
      createReport: client.createReport.bind(client),
      listAdminReports: client.listAdminReports.bind(client),
      listMissionMessages: client.listMissionMessages.bind(client),
      postMissionMessage: client.postMissionMessage.bind(client),
    }),
    [client],
  );
}
