import type {
  AuthResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  UpdateProfileRequest,
} from '@kolos/shared-types';
import { ApiClient } from './api-client';

export interface AuthClientOptions {
  baseUrl: string;
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
}

export class AuthClient {
  private readonly api: ApiClient;

  constructor(private readonly options: AuthClientOptions) {
    this.api = new ApiClient({
      baseUrl: options.baseUrl,
      getAccessToken: options.getAccessToken,
      onUnauthorized: async () => {
        try {
          const result = await this.refresh();
          this.options.setAccessToken(result.accessToken);
          return true;
        } catch {
          this.options.setAccessToken(null);
          return false;
        }
      },
    });
  }

  register(data: RegisterRequest): Promise<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data);
  }

  login(data: LoginRequest): Promise<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', data);
  }

  refresh(): Promise<AuthResponse> {
    // Avoid retry loop: a 401 here must not re-trigger refresh via onUnauthorized.
    return this.api.post<AuthResponse>('/auth/refresh', undefined, false);
  }

  logout(): Promise<void> {
    return this.api.post<void>('/auth/logout');
  }

  me(): Promise<MeResponse> {
    return this.api.get<MeResponse>('/me');
  }

  updateProfile(data: UpdateProfileRequest): Promise<MeResponse> {
    return this.api.patch<MeResponse>('/me/profile', data);
  }
}
