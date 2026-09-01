import type { ApiErrorResponse } from '@kolos/shared-types';

export class ApiClientError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: ApiErrorResponse,
  ) {
    super(
      Array.isArray(body.message) ? body.message.join(', ') : body.message,
    );
    this.name = 'ApiClientError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => Promise<boolean>;
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  async request<T>(
    path: string,
    init: RequestInit = {},
    retryOnUnauthorized = true,
  ): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }

    const accessToken = this.options.getAccessToken?.();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(`${this.options.baseUrl}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });

    if (
      response.status === 401 &&
      retryOnUnauthorized &&
      this.options.onUnauthorized
    ) {
      const refreshed = await this.options.onUnauthorized();
      if (refreshed) {
        return this.request<T>(path, init, false);
      }
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => ({
        statusCode: response.status,
        message: response.statusText,
        timestamp: new Date().toISOString(),
        path,
      }))) as ApiErrorResponse;
      throw new ApiClientError(response.status, body);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }
}
