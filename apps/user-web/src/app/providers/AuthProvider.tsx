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
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '@kolos/shared-types';

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
const SESSION_HINT_KEY = 'kolos_session';

function markSessionActive(): void {
  sessionStorage.setItem(SESSION_HINT_KEY, '1');
}

function clearSessionHint(): void {
  sessionStorage.removeItem(SESSION_HINT_KEY);
}

function hasSessionHint(): boolean {
  return sessionStorage.getItem(SESSION_HINT_KEY) === '1';
}

let bootstrapSessionPromise: Promise<AuthResponse | null> | null = null;

function resetBootstrapSession(): void {
  bootstrapSessionPromise = null;
}

function restoreSession(authClient: AuthClient): Promise<AuthResponse | null> {
  if (!hasSessionHint()) {
    return Promise.resolve(null);
  }

  bootstrapSessionPromise ??= authClient
    .refresh()
    .then((result) => result)
    .catch(() => null);

  return bootstrapSessionPromise;
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
      if (!hasSessionHint()) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      const result = await restoreSession(authClient);

      if (cancelled) {
        return;
      }

      if (result) {
        accessTokenRef.current = result.accessToken;
        markSessionActive();
        setUser(result.user);
      } else {
        accessTokenRef.current = null;
        clearSessionHint();
        resetBootstrapSession();
        setUser(null);
      }

      setIsLoading(false);
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
      markSessionActive();
      setUser(result.user);
    },
    [authClient],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const result = await authClient.register(data);
      accessTokenRef.current = result.accessToken;
      markSessionActive();
      setUser(result.user);
    },
    [authClient],
  );

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } finally {
      accessTokenRef.current = null;
      clearSessionHint();
      resetBootstrapSession();
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
