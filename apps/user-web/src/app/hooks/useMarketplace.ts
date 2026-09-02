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

  return {
    upsertAidantProfile: client.upsertAidantProfile.bind(client),
    publishRequest: client.publishRequest.bind(client),
    listPublishedRequests: client.listPublishedRequests.bind(client),
    applyToRequest: client.applyToRequest.bind(client),
  };
}
