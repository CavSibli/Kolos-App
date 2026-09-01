import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AuthClient } from '@kolos/http-client';
import type { AuthUser, LoginRequest, RegisterRequest } from '@kolos/shared-types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/v1';

async function waitForApiReady(maxAttempts = 30, delayMs = 1000): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/health/live`);
      if (response.ok) {
        return true;
      }
    } catch {
      // API not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const accessTokenRef = useRef<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authClient = useMemo(
    () =>
      new AuthClient({
        baseUrl: API_BASE_URL,
        getAccessToken: () => accessTokenRef.current,
        setAccessToken: (token) => {
          accessTokenRef.current = token;
        },
      }),
    [],
  );

  const refreshProfile = useCallback(async () => {
    const profile = await authClient.me();
    setUser(profile);
  }, [authClient]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const apiReady = await waitForApiReady();
        if (!apiReady || cancelled) {
          return;
        }

        const result = await authClient.refresh();
        accessTokenRef.current = result.accessToken;
        if (!cancelled) {
          setUser(result.user);
        }
      } catch {
        accessTokenRef.current = null;
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [authClient]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const result = await authClient.login(data);
      accessTokenRef.current = result.accessToken;
      setUser(result.user);
    },
    [authClient],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const result = await authClient.register(data);
      accessTokenRef.current = result.accessToken;
      setUser(result.user);
    },
    [authClient],
  );

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } finally {
      accessTokenRef.current = null;
      setUser(null);
    }
  }, [authClient]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, isLoading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
